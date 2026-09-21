# Listening to Recart Opt-in Tool Events

If you're integrating Recart with other tools or analytics platforms, you may want to listen to events emitted by Recart's Opt-in Tool. These events help you track user interactions and capture contact information in real-time.

Recart emits **three types of custom events** via the browser’s `window` object. You can listen to these using JavaScript’s `window.addEventListener()` method.

***

## 🔔 Available Events and Payloads

### 1. `recart:optin-tool:interaction`

Emitted when a visitor interacts with a popup in any way — including viewing, clicking, or closing it.

**Payload Schema:**

```ts
interface OptinToolInteractionPayload {
  optinToolId: string
  optinToolName: string
  optinToolExperimentId?: string
  optinToolExperimentName?: string
  interaction: string
}
```

**Possible `interaction` values:**

* `impression` – popup was shown
* `emailClick` – visitor clicked the email CTA
* `smsClick` – visitor clicked the SMS CTA
* `minimizedImpression` – popup was shown in minimized view
* `closePopup` – visitor closed the popup (switches to minimized view)
* `closeMinimized` – visitor closed the minimized popup

***

### 2. `recart:optin-tool:email-captured`

Emitted when a visitor submits their **email address** through the popup.

**Payload Schema:**

```ts
interface EmailCapturedPayload {
  optinToolId: string
  optinToolName: string
  optinToolExperimentId?: string
  optinToolExperimentName?: string
  email: string
}
```

***

### 3. `recart:optin-tool:phone-number-captured`

Emitted when a visitor submits their **phone number** through the popup.

**Payload Schema:**

```ts
interface PhoneNumberCapturedPayload {
  optinToolId: string
  optinToolName: string
  optinToolExperimentId?: string
  optinToolExperimentName?: string
  phoneNumber: string
}
```

***

## 🧠 How to Listen to Events

You can listen to any of these events using `window.addEventListener()` like this:

```js
window.addEventListener('recart:optin-tool:interaction', (event) => {
  const payload = event.detail;
  console.log('User interaction with opt-in tool:', payload);
});

window.addEventListener('recart:optin-tool:email-captured', (event) => {
  const payload = event.detail;
  console.log('Email captured:', payload.email);
});

window.addEventListener('recart:optin-tool:phone-number-captured', (event) => {
  const payload = event.detail;
  console.log('Phone number captured:', payload.phoneNumber);
});
```

***

## 🛠 Example Use Cases

* Send captured emails or phone numbers to a CRM
* Trigger custom analytics events in tools like Segment or GA4
* Measure interaction rates for popup performance

***

If you have questions about specific interactions, data payloads, or implementation best practices, feel free to contact our support team or your Recart account manager.
