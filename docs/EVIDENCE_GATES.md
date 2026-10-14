# Evidence gates that are not permissions

These gates decide later work. Meeting the words on this page is not the same as having the measurements. Neither gate has been passed.

## Native game delivery

The live product is the responsive website. The Expo app in `apps/mobile` can sign in, manage children, and play: simple templates run natively, and motion or Pixi games run in an allowlisted WebView. That app is not the primary way children play, and it has not been submitted to an app store.

Do not market the app as the product, and do not submit it, until both of these are measured on production:

- Day-7 retention: at least 25% of new parent accounts return with a child play on day 7.
- Free to paid: at least 3% of verified free accounts start a paid week or month within 30 days.

Store billing is a separate requirement. The app does not sell a subscription. Read `apps/mobile/docs/MOBILE_ARCHITECTURE.md`.

## Dedicated merchant branding

Checkout uses the shared FKTech Razorpay account. The payment page shows FKTech, and FunBerry copy says “FKTech provides FunBerry Kids Premium.”

Ask Razorpay for a FunBerry-only merchant name only if parents still leave checkout after that sentence is visible, and the drop-off is counted. A guess that the name is confusing is not that measurement.
