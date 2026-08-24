# Tong An Photography — Photo Store

## Selling flow

1. Visitor opens a photo preview.
2. Visitor sees price and license information.
3. Visitor adds the photo to cart.
4. Visitor checks out and follows the configured payment method.
5. Visitor uploads the payment receipt.
6. Admin verifies the payment.
7. The customer receives a private download link for the original file.

## Recommended product setup

Every sellable photograph should have:
- Preview image: compressed, web-safe and optionally watermarked.
- Original file: full-resolution file kept private.
- Title.
- Category.
- Description/story.
- Price.
- License type.
- Location (optional).
- Capture date (optional).
- Camera/lens metadata (optional).

## Important security rule

Never expose the original high-resolution storage URL publicly. The original should only be served after the order is paid/approved, through an authenticated or signed download URL.

## Before launch

- Configure the real payment/QR account.
- Configure the business email in the Contact page.
- Upload at least 8–12 photographs.
- Give every photograph a clear title and price.
- Test payment receipt upload.
- Test admin approval.
- Test a download from a non-admin customer account.
- Run `npm run build` before deployment.
