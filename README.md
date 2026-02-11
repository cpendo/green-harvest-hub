# Green Harvest Hub

**Agricultural supply chain ERP for tea cooperatives.**

Green Harvest Hub is a web application for managing the full tea cooperative supply chain — from farmer registration through raw tea deliveries, processing, buyer management, and sales tracking.

Built as a demo application for [Glide](https://github.com/cpendo/glide), showing how natural language automation works on a real data-intensive app.

## Features

- **Farmer Management** — Register farmers, track status, output preferences, and delivery history
- **Incoming Inventory** — Record raw tea deliveries with weight, grade, moisture content, and pricing
- **Processing** — Track batch processing from raw input to finished output with quality scoring
- **Buyer Management** — Manage buyers, companies, contact info, and transaction history
- **Sales** — Record sales to buyers with batch tracking, pricing, and payment status
- **Dashboard** — Overview stats, recent activity, and supply chain metrics

## Glide Integration

This app is Glide-enabled. With the [Glide Chrome extension](https://github.com/cpendo/glide) installed, you can automate any action using natural language:

```
"add farmer Jane Wambui, phone 0722334455, from Kericho"
"rekodi delivery ya James Mwangi, kilo 200, grade A, unyevu 12%, bei 85 kwa kilo"
"update farmer James Mwangi to inactive"
"delete farmer Jane Wambui"
```

The `glide.manifest.json` in the `public/` folder describes the app's forms and navigation to the AI.

## Getting Started

```bash
git clone https://github.com/cpendo/green-harvest-hub.git
cd green-harvest-hub
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- React Router
- React Hook Form + Zod
- LocalStorage persistence
- Vite
