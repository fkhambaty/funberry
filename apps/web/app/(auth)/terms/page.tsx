"use client";

import { brand } from "@funberry/config";
import { checkoutCopy } from "@funberry/brand/identity";

export default function TermsPage() {
  return (
    <main className="fb-legal">
      <article>
        <h1 className="font-display text-sky-900">Terms of Service</h1>
        <p className="fb-updated">
          Last updated: 13 October 2026
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By using {brand.name}, you agree to these Terms of Service. If you are
          a parent or guardian creating an account for your child, you accept
          these terms on their behalf.
        </p>

        <h2>2. Accounts</h2>
        <p>
          You must be at least 18 years old to create a parent account. You are
          responsible for maintaining the security of your account credentials.
        </p>

        <h2>3. Subscriptions</h2>
        <ul>
          <li>Free accounts have access to limited content.</li>
          <li>Premium subscriptions unlock all content and features.</li>
          <li>
            Subscriptions auto-renew unless cancelled 24 hours before the end of
            the billing period.
          </li>
          <li>
            {checkoutCopy.provides}. The Razorpay page shows the merchant name FKTech.
            Weekly is ₹99 and monthly is ₹349. Both renew until you turn auto-renew off
            in the parent dashboard.
          </li>
          <li>
            Closing checkout before payment is not a charge. Turning off auto-renew
            keeps Premium until the end of the period already paid and does not refund
            that period.
          </li>
          <li>
            FunBerry does not offer an automatic refund. Email {brand.supportEmail}
            about a charge. If a refund is approved, it is sent through Razorpay to the
            original payment method.
          </li>
        </ul>

        <h2>4. Content</h2>
        <p>
          All game content, illustrations, and educational materials are owned by
          {brand.name}. You may not reproduce, distribute, or create derivative
          works without permission.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>
          {brand.name} is designed for educational purposes for children ages
          5-8. Any misuse, hacking, or unauthorized access is prohibited.
        </p>

        <h2>6. Contact</h2>
        <p>
          Questions? Reach us at{" "}
          <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.
        </p>
      </article>
    </main>
  );
}
