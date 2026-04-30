# Ganesh Tel Mill - VAT & Inventory Portal

A professional inventory and VAT management system built with Next.js 14 (App Router), Tailwind CSS, and Google Sheets.

## Features
- **Dashboard:** Real-time KPIs for purchases, sales, and VAT dues.
- **Master Data:** Manage Raw Materials, Finished Goods, Byproducts, Parties, and GL Accounts.
- **Transactions:** Record Purchases, Sales, and Production with live cost/bill previews.
- **Reports:** Filterable Stock Reports (RM/FG) and automated VAT Summary calculations.
- **Costing:** Monthly overhead budget management with Preliminary vs Final rate locks.

## Tech Stack
- **Frontend:** Next.js (React 19), Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend:** Google Sheets + Google Apps Script (Web App).
- **State:** React Context API + LocalStorage.

## Setup Instructions

### 1. Google Sheets Configuration
1. Create a new Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Copy the content of `Code.gs` from this project into the Apps Script editor.
4. Save the project and click **Run > onOpen** (authorize if prompted).
5. Back in the Google Sheet, you should see a new menu **📦 Ganesh Tel Portal**. Click **Initialize Tabs**.

### 2. Deploy Backend
1. In the Apps Script editor, click **Deploy > New Deployment**.
2. Select **Web App**.
3. Set "Execute as" to **Me**.
4. Set "Who has access" to **Anyone**.
5. Click **Deploy** and copy the **Web App URL**.

### 3. Frontend Configuration
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open `http://localhost:3000` in your browser.
4. Go to **Settings** in the sidebar.
5. Paste your **Web App URL** into the Backend Integration section.
6. Save Settings.

## Project Structure
- `app/`: Next.js pages and layouts.
- `components/`: Reusable UI, layout, and form components.
- `lib/`: Business logic, calculations, API client, and state management.
- `Code.gs`: The backend script for Google Sheets.

## Business Logic
- **VAT:** Standard 13% rate applied to taxable transactions.
- **Weighted Average Cost:** Calculated dynamically by the Stock Journal for accurate COGS and GP reporting.
- **Costing:** Overhead rates are preliminary until the month is set to FINAL in the Costing section.
