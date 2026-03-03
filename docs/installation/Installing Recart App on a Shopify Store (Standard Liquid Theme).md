---
stoplight-id: eziwwxwkf1hwg
tags: [installation, integration]
---

# Installing Recart on a Shopify Store (Standard Liquid Theme)

This guide is for Shopify stores using a standard Online Store 2.0 theme — Dawn, Craft, Sense, or any theme from the Shopify Theme Store that supports app embeds.

This is the simplest integration path. No custom code or engineering work is required.

---

# Prerequisites

- An active Shopify store
- A Shopify theme that supports App Embeds (all Online Store 2.0 themes do)

---

# Installation Steps

## Step 1: Install the Recart App

Go to the Shopify App Store and install Recart: [https://apps.shopify.com/recart](https://apps.shopify.com/recart)

Authorize the app when prompted. This grants Recart access to the Shopify APIs it needs for cart tracking, order data, and customer information.

## Step 2: Complete Recart Onboarding

After installation, the Recart dashboard will walk you through initial setup — connecting your SMS provider, configuring your first popup, etc. Follow the onboarding steps.

## Step 3: Enable the Theme Extension

Recart will prompt you to enable its App Embed block in your Shopify theme. This can also be done manually:

1. In your Shopify admin, go to **Online Store → Themes**
2. Click **Customize** on your active theme
3. In the theme editor, click **App Embeds** (left sidebar)
4. Toggle **Recart** to enabled
5. Click **Save**

This injects Recart's JavaScript onto every page of your store.

## That’s It

Recart is now fully operational on your store.

---

# How It Works Behind the Scenes

When you install the Recart Shopify app, several things happen automatically that make the integration seamless:

## Script Injection

The theme extension loads two JavaScript files on every page of your storefront:

- **settings.js** (from [storefront.recart.com](http://storefront.recart.com)) — Contains every settings you can set on Recart dashboard.
- **loader.js** (from [storefront.recart.com](http://storefront.recart.com)) — Manages to load scripts that Recart needs to manage session creation, visitor identification, cookie management, and event tracking, popup rendering, display logic, and suppression rules. It also creates the `window._recart` SDK object.

These scripts run in the visitor's browser and are responsible for session tracking, popup display, and capturing email/phone opt-ins.

## Cart Tracking via Shopify Webhooks

Shopify's standard Liquid themes use the AJAX Cart API for cart operations (add to cart, update quantity, remove item). When the cart changes, Shopify fires cart webhooks (`carts/create`, `carts/update`) to all installed apps that have registered for them — including Recart.

This means Recart automatically knows what's in every visitor's cart without any additional integration work. Cart abandonment detection, recovery URLs, and win-back flows all work out of the box.

## Order and Customer Data

The Shopify app integration also gives Recart access to order webhooks and customer data through the Shopify Admin API. This powers:

- Customer and order data sync
- Customer segmentation
- Revenue attribution (which Recart messages led to purchases)

---

# What's Included Automatically

| Feature | Works automatically? |
| --- | --- |
| Session tracking | Yes |
| Popups & opt-in tools | Yes |
| Cart abandonment detection | Yes |
| Cart recovery URLs | Yes |
| Browse abandonment | Yes |
| Revenue attribution | Yes |
| Order & customer data sync | Yes |
| Product catalog sync | Yes |
| All other SMS features | Yes |

---

# Troubleshooting

**Recart popups aren't showing:**

Verify the theme extension is enabled in Online Store → Themes → Customize → App Embeds. Also check that popups are configured and active in the Recart dashboard.

**Cart abandonment flows aren't triggering:**

Make sure the store has active cart abandonment automated flow configured in Recart. The visitor also needs to be an identified subscriber (has provided email or phone) for messages to be sent either through Recart opt-in tools or through the checkout.

**Scripts not loading:**

Check your browser's developer console (Network tab) for the Recart script requests. If they're blocked, check if you have a script-blocking app, content security policy, or ad blocker interfering.