# How to Setup a Subscription Flow with Recart API

This guide walks you through the process of setting up a subscription flow using the Recart API. The flow involves creating an event source with an "optin" type, setting up an integration flow, and then initiating SMS subscriptions using that event source.

## Overview

The subscription flow consists of three main steps:
1. **Create an Event Source** - Register a new event source with "optin" type
2. **Create an Integration Flow** - Create a new integration flow with the event source in Recart application
3. **Initiate SMS Subscription** - Use the registered event source to start SMS subscriptions

## Step 1: Create an Event Source with Optin Type

Before you can start collecting SMS subscriptions, you need to create an event source that will track where your subscribers are coming from.

### Prerequisites
- Valid API credentials for the Recart API
- Access to the event source creation endpoint

### Process
1. **Prepare Event Source**: You'll need to specify the event source type as "optin" and provide any required metadata for your subscription source. 
   
   Example payload:
   ```json
   {
     "category": "3rd-party-name",
     "name": "subscription", 
     "type": "optin"
   }
   ```

2. **Make API Request**: Send a request to [create the event source](https://recart-app.stoplight.io/docs/openapi/9c1e977516236-create-new-event-source) through the appropriate endpoint in the Recart API.

## Step 2: Create an Integration Flow

An active welcome flow must be created to trigger legal and welcome messages for your new subscribers.

### Prerequisites
- Successfully created event source from Step 1
- Access to [Recart](https://app.recart.com/) dashboard

### Process
1. **Navigate to SMS Integrations**: Open the Recart dashboard and navigate to Automated flows > [SMS Integrations](https://app.recart.com/sequences/sms-integrations).

2. **Create a New Flow**: Create a new Integration flow.

3. **Configure the Trigger**: Select the trigger and set the integration and event pair to the event source created in Step 1.

4. **Save and Activate the Flow**: Click "Activate" in the upper right corner to enable the flow.

## Step 3: Initiate SMS Subscription

After your event source is registered and the flow is activated, you can begin collecting SMS subscriptions from users.

### Prerequisites
- Successfully created event source from Step 1
- Active integration flow from Step 2
- Customer contact information (phone number)

### Process
1. **Collect Customer Information**: Gather the necessary customer details, including their phone number for SMS delivery.

2. **Reference Event Source**: Use the event source created in Step 1 to link the subscription to the appropriate source.

3. **Submit Subscription Request**: Send the [subscription request](https://recart-app.stoplight.io/docs/openapi/f57f57f1b12b7-initiate-sms-subscription) through the SMS subscription endpoint.

4. **Handle Response**: Process the API response to confirm successful subscription creation or handle any errors.

## Important Considerations

### SMS Subscription Requirements
- Ensure you have proper consent from customers before subscribing them to SMS
- Comply with [TCPA regulations](https://www.fcc.gov/sites/default/files/tcpa-rules.pdf) and local SMS marketing laws
- The integration flow must be active to send welcome messages
- Phone numbers should be in E.164 format (e.g., +1234567890)
