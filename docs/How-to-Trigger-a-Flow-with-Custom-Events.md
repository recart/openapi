# How to Trigger a Flow with Custom Events

This guide walks you through triggering a Recart flow from your own backend using custom events. The flow involves creating an event source with a "custom" type, setting up an integration flow, and then posting events that trigger it.

Use this when something happens in your system that should start an SMS flow for an existing subscriber — a failed payment, a back-in-stock item, a shipped order, a completed booking.

> **Custom events do not collect consent.** A custom event only triggers messaging for a phone number that is *already* an opted-in SMS subscriber. If you need to subscribe someone as part of the same integration, use an event source with the `optin` type instead — see [How to Setup a Subscription Flow](./How-to-Setup-a-subscription-flow.md).

## Overview

The custom event flow consists of three main steps:
1. **Create an Event Source** - Register a new event source with "custom" type
2. **Create an Integration Flow** - Create a new integration flow with the event source in Recart application
3. **Post Events** - Send events referencing that event source to trigger the flow

## Step 1: Create an Event Source with Custom Type

An event source declares the kind of event you will be sending, so it can be selected as a flow trigger in the dashboard. It only needs to be created once per event type.

### Prerequisites
- Valid API credentials for the Recart API
- Access to the event source creation endpoint

### Process
1. **Prepare Event Source**: Specify the event source type as "custom", along with the `category` and `name` that identify your event.

   Example payload:
   ```json
   {
     "category": "payment",
     "name": "billing attempt failed",
     "type": "custom"
   }
   ```

   The `category` and `name` pair is what you will select in the dashboard, and what every event must repeat verbatim:
   - `category` — the integration or system the event comes from (e.g. `payment`, `inventory`, `booking`)
   - `name` — the event itself (e.g. `billing attempt failed`, `back in stock`)

2. **Make API Request**: Send a request to [create the event source](https://recart-app.stoplight.io/docs/openapi/9c1e977516236-create-new-event-source) through the appropriate endpoint in the Recart API.

Create a separate event source for each distinct event you want to trigger a flow, so each one can drive its own flow.

## Step 2: Create an Integration Flow

An active integration flow must exist for the event source, otherwise posted events have nothing to trigger.

### Prerequisites
- Successfully created event source from Step 1
- Access to [Recart](https://app.recart.com/) dashboard

### Process
1. **Navigate to SMS Integrations**: Open the Recart dashboard and navigate to Automated flows > [SMS Integrations](https://app.recart.com/sequences/sms-integrations).

2. **Create a New Flow**: Create a new Integration flow.

3. **Configure the Trigger**: Select the trigger and set the integration and event pair to the event source created in Step 1 — the integration is the source's `category`, the event is its `name`.

4. **Compose the Messages**: Build the messages the flow should send when the event arrives.

5. **Save and Activate the Flow**: Click "Activate" in the upper right corner to enable the flow.

## Step 3: Post Events

With the event source registered and the flow activated, post an event whenever the corresponding thing happens in your system.

### Prerequisites
- Successfully created event source from Step 1
- Active integration flow from Step 2
- The subscriber's phone number

### Process
1. **Detect the Event**: Trigger this step from whatever happens in your system — a webhook from your payment provider, a job that detects restocked inventory, a state change in your own database.

2. **Reference the Event Source**: Set `source.category` and `source.name` to exactly the values used in Step 1. A mismatch means no flow is triggered.

3. **Attach Event Data (optional)**: Pass event data in `properties`.

   Properties are not automatically available to the flow. A property reaches the message only if a matching variable has been set up for your account, in which case the message inserts it from the flow editor's variable picker. Contact Support to have a variable enabled for a property you want to use.

   Any property without such a variable is accepted and then discarded. The request still returns `200` and the flow still triggers, so a discarded property looks exactly like a delivered one — there is no warning. Do not design a message around event data that has not been set up. To personalise or target on your own data, store it on the subscriber with `PATCH /subscribers` and use it as a segment condition instead.

   Example payload:
   ```json
   {
     "type": "events",
     "attributes": {
       "phoneNumber": "+36301234567",
       "source": {
         "category": "payment",
         "name": "billing attempt failed"
       },
       "properties": {
         "yourVariableName": "your value"
       }
     }
   }
   ```

4. **Submit the Event**: Send the request to the `POST /events` endpoint in the [Recart API reference](https://recart-app.stoplight.io/docs/openapi).

   ```js
   const response = await fetch('https://api.recart.com/app-integrations/2023-12/events', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/vnd.api+json',
       'X-Recart-API-Key': '<apiKey>',
     },
     body: JSON.stringify({
       data: {
         type: 'events',
         attributes: {
           phoneNumber: '+36301234567',
           source: {
             category: 'payment',
             name: 'billing attempt failed',
           },
           properties: {
             yourVariableName: 'your value',
           },
         },
       },
     }),
   })

   if (response.ok) {
     // The body is the plain-text string `OK`, not JSON — do not call response.json()
     console.log(await response.text())
   } else {
     const { errors } = await response.json()
     console.error(errors)
   }
   ```

5. **Handle Response**: A `200` means the event was accepted and queued — not that a message was sent. Error responses carry an `errors` array whose `code` and `detail` identify the cause:

   | Status | Code | What it means |
   | --- | --- | --- |
   | `400` | `ERR_BAD_REQUEST` | Payload failed validation, or `phoneNumber` is unparseable. `detail` lists the offending fields. |
   | `401` | `ERR_UNAUTHORIZED` | The `X-Recart-API-Key` header is missing. |
   | `403` | `ERR_FORBIDDEN` | The API key is unknown or has been revoked. |
   | `404` | `ERR_NOT_FOUND` | No subscriber exists for `phoneNumber`. |
   | `415` | `ERR_UNSUPPORTED_MEDIA_TYPE` | `Content-Type` must be `application/vnd.api+json` or `application/json`. |
   | `417` | `ERR_EXPECTATION_FAILED` | Either the event source is not registered for the site, or the subscriber has no active SMS subscription. `detail` distinguishes the two. |
   | `500` | `ERR_INTERNAL_SERVER_ERROR` | The event could not be queued. Safe to retry. |

   `400`, `404`, `415` and `417` are permanent for the given payload — retrying unchanged will fail the same way. Retry only `500` and network failures, so an event is not silently lost.

## Important Considerations

### Event Properties
- Values can be strings or numbers
- Nested objects are not supported — flatten your payload before sending
- Maximum 10 properties per event

### Triggering Requirements
- The event source `category` and `name` must match the values in the event exactly — a mismatch is reported as `417`, not as a silent failure
- Allow a few seconds between creating an event source and posting the first event against it; registered sources are cached briefly
- The integration flow must be active. Flow state is *not* validated when the event is posted: if no active flow uses the event source as its trigger, the event is still accepted with `200` and simply results in no message. When events succeed but nothing is sent, check the flow first
- The phone number must belong to an existing SMS subscriber; custom events do not create subscriptions
- Phone numbers should be in E.164 format (e.g., +1234567890)

### Messaging Requirements
- Comply with [TCPA regulations](https://www.fcc.gov/sites/default/files/tcpa-rules.pdf) and local SMS marketing laws
- Only send transactional or promotional content consistent with the consent the subscriber gave
- Post events as the underlying thing happens — flows are triggered in real time, so stale events reach subscribers as if they were current
