# PRD Requirements Summary (Extracted)

Source: `Documents/Website Requirements.pdf` and `Documents/Website Specifications.pdf` (extracted text).

## User Types & ID Format
- User types: Farmer (B2C), Agri-Retailer (B2B), Agent (B2A).
- Farm E-Store ID format: `FES` + `B2C|B2B|B2A` + last 4 digits of mobile.
  - Examples: `FESB2C0001`, `FESB2B9999`, `FESB2A0101`.

## Auth
- Login/Register via mobile number and OTP.
- OTP resend after 30 seconds.

## Role-Based Pricing
- Farmer: discount prices.
- Agri-Retailer: wholesale prices after GST/license verification and admin activation.
- Agent: commission-based pricing; show commission % and earnings per product.

## Checkout/Payments
- Cash on Delivery: part payment required (10% of order value).

## Kisan Cash Credits
- 1 credit = INR 1.
- Can use only 50% of order value.
- Only for Farm e-Plus+ members.

## Membership (Conflict Noted)
- Requirements PDF:
  - Silver INR 99 (1% credits), Gold INR 149 (3%), Platinum INR 249 (5%).
  - Validity: 5 purchases within 70 days.
- Specifications PDF:
  - Silver INR 99 (5% credits), Gold INR 179 (8%), Platinum INR 249 (12%).
  - Validity: 10 purchases within 70 days.
- Both: add 18% GST, not applicable to Agri-Retailers and Agents.

## Inventory & Availability
- Hide out-of-stock products.
- Inventory & billing management required (scope TBD).

## Misc Features
- Restrict screenshotting (platform capability, likely mobile-app only).
- Show network status (offline/online).
- Discount icon update (UI).

## Product Filtering & Sorting
- Sort by top rated, A-Z, Z-A, price low/high.
- Filter by category, brand, technical name, mode of action, form, packaging, formulation, usage method, crops, price range, stock, discount band, delivery speed, rating.

## Additional Modules
- Crop diagnosis: recommendation flow; show same-technical products.
- Combo offers feature.
- Agent earnings dashboard.
- Kisan Cash credits + membership dashboard.
- Locate: counters/farm e-store locations.

---

## Conflicts To Resolve
- Membership pricing, cashback %, and purchase count differ between PDFs.
- Need decision for final membership rules before implementation.
