---
stoplight-id: p4iim5lsy4g0u
tags: [installation]
---

# Installing Recart on a Headless Shopify Store

This guide is for Shopify stores using a headless frontend — Hydrogen/Oxygen, Next.js, Nuxt.js, Gatsby, or any custom build that renders outside of Shopify's Online Store theme engine.

The integration steps are the same regardless of which headless framework you use.

---

# How Recart Integrates with Headless Shopify

On a standard Shopify Liquid theme, Recart receives cart data automatically through Shopify's webhook system. **This does not work on headless storefronts.**

Shopify's cart webhooks (`carts/create`, `carts/update`) only fire when the storefront uses the AJAX Cart API, which is exclusive to Liquid themes. All headless storefronts — including Hydrogen using Shopify's own Storefront API — use the Storefront API for cart operations, and these do not trigger cart webhooks.

This means Recart has no automatic way to know what's in a visitor's cart on a headless store. To integrate Recart with a store on headless frontend, you need to implement a server-side integration to sync cart data with Recart's API.

---

# Prerequisites

- An active Shopify store with the Recart app installed from the Shopify App Store
- Recart onboarding completed
- Your Recart **API key** (found in the Recart dashboard under Settings → API keys)
- Your Recart **site ID** (found in the Recart dashboard under Settings)
- A backend service or server-side layer that can make authenticated HTTP requests to Recart's API
- Access to your headless frontend codebase to add script tags

---

# Integration Overview

The headless integration has two parts:

1. **Client-side (frontend):** Load Recart's JavaScript on your storefront. This handles sessions, popups, and subscriber capture.
2. **Server-side (backend):** Call Recart's REST API whenever the cart changes. This is the only manual integration required — orders, customers, and product data still sync automatically through the Shopify app.

---

# Part 1: Client-Side Setup

## Step 1: Add the Recart Scripts

To generate the correct script URLs for your store, you need three values:

| Variable | Where to Find It | Example |
| --- | --- | --- |
| **Site ID** | Recart dashboard → Settings | `650d9a70bd1629d9ab845f90` |
| **MyShopify URL** | Shopify Admin → Settings → Domains | `your-brand.myshopify.com` |
| **Store URL** | Your live storefront domain | `yourbrand.com` |

### Script Template

Add both scripts to the `<head>` of your root layout component or HTML document. Replace the three placeholder values with your own:

```html
<script async src="https://storefront.recart.com/settings/SITE_ID/settings.js?shop=MYSHOPIFY_URL"></script>
<script async src="https://storefront.recart.com/loader.js?domain=STORE_URL&account=SITE_ID&hasGMInitParams=1&shop=MYSHOPIFY_URL"></script>
```

### Example

For a brand with:

- **Site ID:** `6a1b2c3d4e5f6a7b8c9d0e1f`
- **MyShopify URL:** `acme-outfitters.myshopify.com`
- **Store URL:** `acmeoutfitters.com`

The ready-to-use scripts would be:

```html
<script async
  src="https://storefront.recart.com/settings/6a1b2c3d4e5f6a7b8c9d0e1f/settings.js?shop=acme-outfitters.myshopify.com">
</script>

<script async
  src="https://storefront.recart.com/loader.js?domain=acmeoutfitters.com&account=6a1b2c3d4e5f6a7b8c9d0e1f&hasGMInitParams=1&shop=acme-outfitters.myshopify.com">
</script>
```

We recommend loading both scripts with the `async` attribute as shown above. If your framework requires `defer` instead, contact your Recart account manager. These can also be loaded via Google Tag Manager.

## What This Gives You

Once the scripts are loaded, the following features work immediately — no API integration needed:

- Session tracking and visitor identification
- Popup display, targeting, and suppression
- Email and phone number capture
- `window._recart` SDK (session ID, event listeners, readiness checks)

What does **not** work without the API integration: cart abandonment detection, cart recovery URLs, win-back flows, and revenue attribution for cart-based events.

---

# Part 2: Server-Side Cart Integration

This is the part that requires engineering work. Your backend needs to call Recart's REST API every time a visitor's cart changes.

## Architecture Overview

The data flow is:

1. Visitor interacts with cart on your frontend
2. Your frontend reads the Recart session ID from `window._recart.getSessionId()`
3. Your frontend sends the session ID + cart data to your backend
4. Your backend calls Recart's REST API with the session ID, cart contents, and your API key

## Step 2: Read the Session ID

Recart's tracking script creates a session for every visitor and exposes it via the `window._recart` object.

```jsx
// Wait for Recart to initialize
if (window._recart && window._recart.isReady()) {
  const sessionId = window._recart.getSessionId();
} else {
  // Listen for ready event
  window.addEventListener('recart:ready', () => {
    const sessionId = window._recart.getSessionId();
  });
}
```

Pass this session ID to your backend along with the cart data whenever the cart changes.

## API Basics

All Recart API calls use the following base URL, auth header, and content type:

```
Base URL: https://api.recart.com/app-integrations/2023-12
Auth:     X-Recart-API-Key: YOUR_API_KEY
Content:  application/vnd.api+json
```

## Step 3: Implement Cart Update — PUT /carts/{sessionId}

Call this endpoint from your backend every time an item is added, removed, or updated in the cart. The request must include the **full current cart contents** (not just the delta).

**Endpoint:** `PUT /carts/{sessionId}`

**Headers:**

```
X-Recart-API-Key: YOUR_API_KEY
Content-Type: application/vnd.api+json
```

**Request Body:**

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
          "productId": "1234567890",
          "variantId": "0987654321",
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

The `lineItems` array must always contain **all current items** in the cart. Recart overwrites the previous cart state with each call. Returns `204 No Content` on success.

## Step 4: Implement Cart Clear — DELETE /carts/{sessionId}

Call this when the visitor empties their entire cart.

**Endpoint:** `DELETE /carts/{sessionId}`

**Headers:**

```
X-Recart-API-Key: YOUR_API_KEY
```

No request body required. Returns `204 No Content` on success.

---

With Parts 1 and 2 complete (scripts + cart tracking), Recart is fully operational on your headless store. Sessions are tracked, carts are synced, abandonment flows work, and orders/customers/products continue to sync automatically through the Shopify app.

---

# Additional API Capabilities

The cart tracking endpoints above are the only required server-side integration for headless Shopify. Recart's API also supports the following — implement these only if you need the specific use case:

- **Abandonment signaling** (`POST /abandonments`) — Explicitly trigger a cart or browse abandonment flow. Only needed if you want to control abandonment timing yourself; Recart handles this automatically by default.
- **SMS subscriptions** (`POST /subscriptions`, `DELETE /subscriptions`) — Create or remove SMS subscribers via API. Only needed if you capture phone numbers outside of Recart's popups.
- **List management** (`POST /lists/{listId}/phone-numbers`) — Bulk add or remove phone numbers from Recart lists.
- **Direct messaging** (`POST /messages`, `GET /messages/{id}`) — Send SMS/MMS messages directly and check delivery status.
- **Webhooks** (`POST /webhooks`, `GET /webhooks`, `DELETE /webhooks/{id}`) — Receive real-time notifications from Recart (incoming messages, outgoing messages, subscribe/unsubscribe events).
- **Flows** (`GET /flows`, `GET /flows/{id}`) — Read-only. List flows and check their status.

Full details on all endpoints: [Recart API on Stoplight](https://recart-app.stoplight.io/docs/openapi)

---
