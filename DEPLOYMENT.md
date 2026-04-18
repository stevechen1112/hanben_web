# Hanben Admin Deployment

## Linode Notes

目前已實測的 Linode 主機規格為 `1 vCPU / 2 GB RAM`。在這個規格下，預設 `next build` (Turbopack) 可能會在 compile 階段直接失敗且沒有足夠可讀的錯誤輸出；改用 `npm run build:linode` (`next build --webpack`) 可穩定完成 build。

如果沿用目前這台 Linode，建議部署順序如下：

1. `npm ci --include=dev`
2. `npm run db:generate`
3. `npx prisma db push`
4. `npm run db:seed`
5. `npm run build:linode`
6. `systemctl restart hanben-web`

補充：目前 repo schema 仍領先既有 migration，所以正式機器若只跑 `prisma migrate deploy`，可能不會得到完整 schema；在補齊 migration 之前，Linode 仍應使用 `npx prisma db push`。

## Phase 6D Checklist

1. Vercel
   - Connect the GitHub repository to Vercel.
   - Add production and preview environment variables from `.env.example`.
   - Set the production domain to `hanben.com.tw`.

2. PostgreSQL
   - Provision Neon, Supabase, or Railway PostgreSQL.
   - Update `DATABASE_URL`.
   - Run `npm run db:generate` and `npx prisma db push` or `npx prisma migrate deploy`.

3. DNS
   - Point `hanben.com.tw` and `www.hanben.com.tw` to Vercel through Cloudflare.
   - Keep proxy mode compatible with Vercel SSL.

4. ECPay / Resend / UploadThing
   - Replace all stage credentials with production values.
   - Verify webhook callback URLs use the production domain.

5. Validation
   - Run full checkout tests for credit card, ATM, and CVS code.
   - Verify ECPay logistics create / callback / print flows.
   - Run responsive QA on desktop, tablet, and mobile.
   - Record Lighthouse screenshots and scores.

6. Monitoring
   - Enable Vercel Analytics.
   - Configure Sentry DSN if used.
   - Current repository does not yet include completed Sentry SDK wiring, so DSN values are placeholders unless Sentry setup is added.
   - Add uptime monitors for `/`, `/checkout`, and `/api/webhooks/ecpay/payment`.

## ECPay Handoff Checklist

Prepare the following before switching from stage to production:

1. Payment credentials
   - `ECPAY_MERCHANT_ID`
   - `ECPAY_HASH_KEY`
   - `ECPAY_HASH_IV`

2. Logistics credentials
   - `ECPAY_LOGISTICS_MERCHANT_ID`
   - `ECPAY_LOGISTICS_HASH_KEY`
   - `ECPAY_LOGISTICS_HASH_IV`
   - These are separate from payment credentials.

3. Callback domain
   - Public HTTPS domain for storefront/admin.
   - ECPay must reach `/api/webhooks/ecpay/payment` and `/api/webhooks/ecpay/logistics`.

4. Logistics sender information
   - `ECPAY_SENDER_NAME`
   - `ECPAY_SENDER_PHONE`
   - `ECPAY_SENDER_ZIP`
   - `ECPAY_SENDER_ADDRESS`

5. Scope confirmation
   - Whether to enable credit card.
   - Whether to enable ATM.
   - Whether to enable CVS code.
   - Whether to enable ECPay logistics for home delivery / CVS pickup.

6. Validation support
   - Merchant backend access, or screenshots of the merchant settings pages.
   - Confirmation that callback, return, and logistics permissions are enabled in ECPay.

## Resend Handoff Checklist

Prepare the following before enabling production email sending:

1. Resend account access
   - Invite me or provide the exact verified settings/screenshots if you prefer not to share access.

2. Verified sending domain
   - A domain or subdomain you own for email sending.
   - Resend recommends using a dedicated subdomain to isolate sender reputation.
   - Example: `mail.hanben.com.tw` or `updates.hanben.com.tw`.

3. DNS records
   - Add the SPF record Resend provides.
   - Add the DKIM record Resend provides.
   - DMARC is optional but strongly recommended for trust and deliverability.

4. Environment variables
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `RESEND_FROM_EMAIL` must use the verified domain or subdomain.

5. Sender policy
   - Confirm the sender name and mailbox to use for transactional emails.
   - Recommended: a non-reply or support mailbox such as `noreply@mail.hanben.com.tw`.

6. Validation scope
   - Test order confirmation email.
   - Test forgot-password email.
   - Test contact form notification email.
   - Test paid / shipped / refunded order emails if those flows are enabled in production.

## UploadThing Handoff Checklist

Prepare the following before enabling production media uploads:

1. UploadThing app
   - Create or confirm the production UploadThing app.

2. Environment variables
   - `UPLOADTHING_SECRET`
   - `UPLOADTHING_APP_ID`

3. Domain validation
   - Confirm the production admin domain is allowed to upload files through UploadThing.

4. Validation scope
   - Upload product images from admin.
   - Upload article cover images from admin.
   - Upload files from the media library and verify saved URLs are accessible.