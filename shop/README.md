# Product editing

Edit shop/products.json, then run `python scripts/render_catalogue.py` from the repository root before publishing. Configure Stripe prices and delivery separately.

A stock product requires checkoutEnabled: true, a positive GBP price such as £41.80, and an HTTPS buy.stripe.com link. Set checkoutEnabled: false and regenerate to pause website purchases. Deactivate the Stripe Payment Link too to stop saved links.

Custom builds use enquiryOnly: true and the existing /?build=...#contact enquiry path.

The root README records outstanding seller information. Never publish private order details, personal addresses or secret keys.
