# CircuitFox Tech

Static site for CircuitFox Tech in Ashtead, Surrey. The domain is served through Cloudflare; GitHub Pages builds are also enabled.

## Publishing

Edit shop/products.json, then run `python scripts/render_catalogue.py` before publishing. This refreshes HTML prices, delivery, detail images and checkout state, including for visitors without JavaScript. JavaScript refreshes the same fields at runtime.

Eight stock products use live Stripe Payment Links; four custom builds are enquiry-only. Stripe prices and shipping rates must be changed separately from the website. Each product uses a separate checkout.

To pause a product on the site, set checkoutEnabled to false and regenerate. Deactivate its Payment Link in Stripe too to stop saved/shared links. Never store API keys in this repository.

## Outstanding business details

Confirmed public legal seller identity and a geographical business/correspondence address are still required for terms, privacy and returns/cancellation information. Do not infer these from personal records. Current policy text does not resolve these missing details. Confirm retention arrangements against actual business practice.

Unverified testimonials and the Google reviews button are omitted until real content/profile details are supplied.

Checkout stays live. Monitor Stripe orders and fulfilment separately. Future automated fulfilment must use verified payment webhooks, including successful asynchronous payments, rather than a browser success page.
