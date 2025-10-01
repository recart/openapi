# Storefront integrations for abandonment use cases

## Requirements

- Recart installed and Recart scripts added to the website.
- Product list synced into Recart

## Use cases

### Browse abandonment

The purpose of browse abandonment is to reach out to people who visited a product page.

Because of the prior reason the `/abandonments` resource for this use case should be called only from product pages.

### Cart abandonment

The purpose of cart abandonment is to reach out to people who added at least one product to their cart and they left the website without removing these items from the cart.

The `/abandonments` resource in this case should be called whenever a visitor lefts the site and there is at least one item in her cart.

### Checkout abandonment

The purpose of checkout abandonment is to reach out to people who reached the checkout page, but did not finish the purchase process.

The checkout abandonment only work with Shopify stores at the moment, we do not have API surface yet.

## API usage and resources

You can find the documentation of our API [here](https://recart-app.stoplight.io/docs/openapi).

You can find code examples on every page, regarding the API resources and endpoints please look for code example of the bottom right corner of the page.

> Every API endpoints you can find here requires a `sessionId` parameter. </br></br>You can grab the actual `sessionId` value from within the browser by calling `window._recart.getSessionId()` function.


You need to use two resource to manage you abandonment flows:

- the `/abandonments` to let our system know when someone abandoned your website,
- the `/carts` to let our system know about all cart related interactions.

### Update items in the cart

You should call the [`PUT /carts`](https://recart-app.stoplight.io/docs/openapi/a7fd1e6e897b4-update-cart) endpoint every time a visitor adds or removes an item from the actual cart. The `lineItems` array must contain every item of the cart.

### Clear the whole cart

You should call the [`DELETE /carts`](https://recart-app.stoplight.io/docs/openapi/8629107e8d3d5-clear-cart) endpoint every time a visitor clears its cart. If there is no way on your storefront to clear the cart in one step, you can skip the implementation of this endpoint.

### Register abandonments

You should call the [`POST /abandonments`](https://recart-app.stoplight.io/docs/openapi/e3d6c4ec98c41-abandon-a-session) endpoint when someone leaves a product page on your websites. 

>If you plan to call the endpoint directly from the browser (we advise to not), please ensure you use `window.fetch()` method and not `window.navigator.sendBeacon()`.

If cart is **empty** please set the value of `data.attributes.type` property to `abandonment`. 

If the cart is **not empty**, please set the value of `data.attributes.type` property to `cart`.