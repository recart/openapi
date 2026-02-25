---
stoplight-id: 8deqh01rvb6px
tags: [installation, integration]
---

# Installing Recart on a Non-Shopify Store

This guide is for stores running on any platform other than Shopify — WooCommerce, Magento, BigCommerce, a custom-built platform, or any other e-commerce system. Whether your storefront is server-rendered or headless doesn't matter here; the integration is the same.

There is no Shopify app to install and no webhooks to rely on. Everything is set up manually: you add Recart's JavaScript to your frontend and integrate with Recart's REST API on the backend.

---

# Prerequisites

- A Recart account (contact Recart to get set up)
- Your Recart **site ID** (found in the Recart dashboard under Settings)
- Your Recart **API key** (generated under Settings → General → API keys)
- Access to your storefront's HTML/template files to add script tags
- A backend service that can make authenticated HTTP requests to Recart's API

---

# Integration Overview

The integration has two parts:

1. **Client-side:** Add Recart's JavaScript to your storefront for sessions, popups, and subscriber capture.
2. **Server-side:** Call Recart's REST API for cart tracking and order creation.

Unlike Shopify stores, there is no automatic data sync. There is no separate product catalog or customer database to maintain — product data is sent inline with cart and order payloads, and customers are identified by phone number on each API call.

---

# Part 1: Client-Side Setup

## What This Gives You

With just the scripts, the following works:

- Session tracking and visitor identification
- Popup display, targeting, and suppression
- Email and phone number capture
- `window._recart` SDK (session ID access, event listeners)

Everything cart, order, and fulfillment-related requires the API integration in Part 2.

## Add the Recart Scripts

To generate the correct script URLs for your store, you need two values. Since there is no Shopify backend, your store URL is used for both the `domain` and `shop` parameters:

| Variable | Where to Find It | Example |
| --- | --- | --- |
| **Site ID** | Recart dashboard → Settings | `6901b4ed3fad3b80ef27c728` |
| **Store URL** | Your live storefront domain | `www.yourbrand.com` |

### Script Template

Add both scripts to the `<head>` of every page on your storefront. Replace the two placeholder values with your own:

```html
<script async src="https://storefront.recart.com/settings/SITE_ID/settings.js?shop=STORE_URL"></script>
<script async src="https://storefront.recart.com/loader.js?domain=STORE_URL&account=SITE_ID&hasGMInitParams=1&shop=STORE_URL"></script>
```

### Example

For a brand with:

- **Site ID:** `7b2c3d4e5f6a7b8c9d0e1f2a`
- **Store URL:** `novaessentials.com`

The ready-to-use scripts would be:

```html
<script async
  src="https://storefront.recart.com/settings/7b2c3d4e5f6a7b8c9d0e1f2a/settings.js?shop=www.novaessentials.com">
</script>

<script async
  src="https://storefront.recart.com/loader.js?domain=novaessentials.com&account=7b2c3d4e5f6a7b8c9d0e1f2a&hasGMInitParams=1&shop=www.novaessentials.com">
</script>
```

We recommend loading both scripts with the `async` attribute as shown above. If your setup requires `defer` instead, contact your Recart account manager. These can also be loaded via Google Tag Manager.

---

# Part 2: Server-Side API Integration

> API endpoints below require a `sessionId` parameter. </br></br>You can read the `sessionId` value from the browser by calling `window._recart.getSessionId()` function.

## API Basics

**Base URL:** `https://api.recart.com/app-integrations/2023-12`

**Authentication:** API key sent via header on every request:

```
X-Recart-API-Key: YOUR_API_KEY
```

**Content-Type:** All request and response bodies use JSON:API format:

```
Content-Type: application/vnd.api+json
```

**Error format:** All errors return a JSON:API error object with `id`, `code`, `title`, and `detail` fields.

---

## Architecture

1. Visitor's cart changes on your frontend
2. Your frontend reads `window._recart.getSessionId()`
3. Your frontend sends session ID + cart data to your backend
4. Your backend calls Recart's REST API with the `X-Recart-API-Key` header

## Step 2: Read the Session ID

```jsx
if (window._recart && window._recart.isReady()) {
  const sessionId = window._recart.getSessionId();
} else {
  window.addEventListener('recart:ready', () => {
    const sessionId = window._recart.getSessionId();
  });
}
```

---

## Step 3: Cart Tracking

### Update Cart — PUT /carts/{sessionId}

Call from your backend every time the cart changes. Overwrites the entire cart content.

**Required fields:** `totalPrice` (value + currency), `recoveryUrl`, `lineItems` (array with productId, name, quantity, price). Optional: `variantId` on each line item.

```json
{
  "data": {
    "type": "carts",
    "attributes": {
      "totalPrice": {
        "value": 49.99,
        "currency": "USD"
      },
      "recoveryUrl": "https://yourstore.com/cart",
      "lineItems": [
        {
          "productId": "prod_123",
          "variantId": "var_456",
          "name": "Classic T-Shirt",
          "quantity": 2,
          "price": {
            "value": 24.99,
            "currency": "USD"
          }
        }
      ]
    }
  }
}
```

Returns `204 No Content` on success.

### Clear Cart — DELETE /carts/{sessionId}

Call when the visitor empties their cart or completes checkout. No request body. Returns `204 No Content`.

---

## Step 4: Order Creation

This is how non-Shopify stores push order data to Recart. There is no separate customer or product sync — customer identity (phone number) and product details (line items) are included directly in each order payload.

### Create Order — POST /orders

Call when a customer completes a purchase. Triggers the receipt/order confirmation flow (must be active).

**Required fields:** `orderStatusUrl`, `orderNumber`, `orderId`, `totalPrice`, `lineItems`, `createdAt`. Must include either `phoneNumber` or `sessionId` to identify the customer.

```json
{
  "data": {
    "type": "orders",
    "attributes": {
      "phoneNumber": "+15551234567",
      "sessionId": "SESSION_ID_HERE",
      "orderStatusUrl": "https://yourstore.com/orders/12345/status",
      "orderNumber": "12345",
      "orderId": "67890",
      "totalPrice": {
        "value": 49.99,
        "currency": "USD"
      },
      "createdAt": "2026-02-22T14:00:00.000Z",
      "lineItems": [
        {
          "productId": "prod_123",
          "variantId": "var_456",
          "name": "Classic T-Shirt",
          "quantity": 2,
          "price": {
            "value": 24.99,
            "currency": "USD"
          }
        }
      ],
      "discountCodes": [
        {
          "code": "WELCOME10",
          "amount": 5.00
        }
      ]
    }
  }
}
```

Returns `202 Accepted`.

### Update Order — PUT /orders/{orderId}

Call when an order is modified (e.g. partial refund, item change).

**Required fields:** `phoneNumber`, `orderStatusUrl`, `totalPrice`, `lineItems`, `updatedAt`. Optional: `discountCodes`.

Returns `202 Accepted`.

---

With Parts 1 and 2 complete (scripts + cart tracking + order creation), Recart is fully operational on your store. Sessions are tracked, carts are synced, abandonment flows work, orders are recorded, and revenue attribution is in place.

---

# Additional API Capabilities

The endpoints above cover the core integration. Recart's API also supports the following — implement these only if you need the specific use case:

- **Abandonment signaling** (`POST /abandonments`) — Explicitly trigger a cart or browse abandonment flow. Only needed if you want to control abandonment timing yourself; Recart handles this automatically by default.
- **Fulfillment / shipping notifications** (`POST /fulfillments`) — Send shipment tracking info and trigger a shipping notification flow.
- **SMS subscriptions** (`POST /subscriptions`, `DELETE /subscriptions`) — Create or remove SMS subscribers via API. Only needed if you capture phone numbers outside of Recart's popups.
- **Custom events** (`POST /event-sources`, `POST /events`) — Trigger flows based on custom business events (failed payments, subscription renewals, back-in-stock, etc.).
- **List management** (`POST /lists/{listId}/phone-numbers`) — Bulk add or remove phone numbers from Recart lists.
- **Direct messaging** (`POST /messages`, `GET /messages/{id}`) — Send SMS/MMS messages directly and check delivery status.
- **Webhooks** (`POST /webhooks`, `GET /webhooks`, `DELETE /webhooks/{id}`) — Receive real-time notifications from Recart (incoming messages, outgoing messages, subscribe/unsubscribe events).
- **Flows** (`GET /flows`, `GET /flows/{id}`) — Read-only. List flows and check their status.

Full details on all endpoints, request/response schemas, and examples are in the API reference:

Base URL: `https://api.recart.com/app-integrations/2023-12`

Auth header: `X-Recart-API-Key: YOUR_API_KEY`

Content-Type: `application/vnd.api+json`

Interactive docs: [Recart API on Stoplight](https://recart-app.stoplight.io/docs/openapi)