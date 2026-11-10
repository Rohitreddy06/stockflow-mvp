# StockFlow – MVP Inventory Management System

A multi-tenant inventory management web application built for the Wexa.ai technical assessment. StockFlow enables organizations to track product catalogs, manage stock levels with inline adjustments, configure low-stock alert thresholds, and monitor key inventory metrics from a real-time dashboard.

---

## 🚀 Live Demo & Links

- **Live Deployment:** [https://stockflow-mvp-pkfx.vercel.app](https://stockflow-mvp-pkfx.vercel.app)
- **GitHub Repository:** [https://github.com/Rohitreddy06/stockflow-mvp](https://github.com/Rohitreddy06/stockflow-mvp)

---

## 🔐 Demo Credentials

Use the following test account credentials to evaluate the live deployment:

- **Email:** `xyz@gmail.com`
- **Password:** `12345678`

*(You can also register a brand-new organization and user at `/signup`.)*

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** Custom JWT-based session cookies with `bcryptjs` password hashing
- **Deployment:** Vercel

---

## ✨ Features

- **Multi-Tenant Architecture:** Strict tenant isolation ensuring each organization only views and edits its own inventory.
- **Product Management:** Complete CRUD operations for products (Name, SKU, Description, Cost Price, Selling Price, and Low-Stock Threshold).
- **Inline Stock Adjustments:** Quick quantity increment and decrement actions directly from the inventory table.
- **Dynamic Dashboard:** Real-time summary cards displaying Total SKUs, Total Units on Hand, and an automatic Low-Stock Alerts table.
- **Organization Settings:** Configurable default low-stock alert threshold applied across the tenant.

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone [https://github.com/Rohitreddy06/stockflow-mvp.git](https://github.com/Rohitreddy06/stockflow-mvp.git)
cd stockflow-mvp
