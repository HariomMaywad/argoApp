# AgroRetail - Agricultural Business & Retailer Ordering Platform

Rewritten from Android (Jetpack Compose) to **React 18 + TypeScript + Vite + Tailwind CSS**.

AgroRetail is an end-to-end B2B agricultural commerce and dealership management platform designed for agricultural distributors (pesticides, fungicides, seeds, fertilizers) and their retailer network.

---

## 🌟 Key Features Preserved & Enhanced

### 1. Dual-Persona Architecture
- **Admin / Distributor Portal**: Comprehensive control center for inventory, order fulfillment, credit limits, schemes, tax invoices, and accounting.
- **Retailer / Dealer Portal**: Fast mobile-first ordering catalog, real-time inventory levels, scheme banners, cart checkout with delivery notes, order tracking, and account ledger passbook.
- **Instant Role Switcher**: Quick-switch between Admin and Retailer accounts with mock dealer credentials for rapid testing.

### 2. Full Feature Matrix
- **Product Master Catalog**: SKU codes, brand/company association, packing/pack sizes, selling & purchase rates, MRP, GST rate selector (0%, 5%, 12%, 18%), HSN codes, barcode tracking, and agricultural image presets.
- **Order Management & Workflow**: Multi-stage order tracking (`Pending` → `Confirmed` → `Packed` → `Dispatched` → `Delivered`), item totals, dispatch notes (e.g. Transport LR numbers), and automatic retailer push notifications.
- **Retailer Network Management**: Business profiles, proprietor contacts, GSTIN numbers, credit limit enforcement, market outstandings, 4-digit security PIN authentication, and status toggles.
- **Excel / Busy Accounting ERP Bulk Import**: 3-step import wizard supporting `.xlsx`, `.xls`, and `.csv`. Features automatic column header detection, duplicate handling (`NEW_AND_UPDATE` vs `NEW_ONLY`), stock mode (`REPLACE` vs `ADD`), sample Busy export generator, and full import history audit log.
- **Dealer Passbook & Ledger**: Detailed debit (invoices) and credit (payments) transaction history, running ledger balance calculation, manual debit/credit voucher entries, and statement downloads.
- **Tax Invoices & Billing**: Upload invoice documents, automatic passbook debiting upon bill issuance, and realistic GST tax invoice preview modals.
- **Promotional Schemes & Banner Carousel**: Launch seasonal offers with valid date ranges, display priorities, and instant broadcast push notifications.
- **Payment Reminders**: Automated outstanding balance alerts with one-click **WhatsApp Direct Chat** links (`wa.me`) and payment status tracking.
- **Firm Profile & Bank Credentials**: Complete distributor identity with bank account, IFSC code, and UPI ID for dealer remittances.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production
npm run build
```
