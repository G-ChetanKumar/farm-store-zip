# Pricing Consistency Plan

## Product Variants
- Retail variants: `package_qty`.
- B2B variants: `retailer_package_qty`.
- Agent commission: `agent_commission_type`, `agent_commission_value`.
- Stock fields per variant to support out-of-stock hiding.

## API Output
- Resolve role-specific variants in product list and detail endpoints.
- Return `effective_price`, `original_price`, and `commission` when applicable.
- Filter out out-of-stock variants/products.

## Order Snapshot
- Store `variant_id`, `unit_price`, `original_price`, `role`, and `commission` in orders.
- Prevent future price changes from mutating historical orders.
