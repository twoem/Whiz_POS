# WHIZ POS Mobile App (APK) – Modern Architecture & Design Guide

**Version:** 2.0.0 (Modern UI Overhaul)  
**Target Platform:** Android 5.0+ (Lollipop) → Android 14+  
**Design Language:** Modern • Glassmorphic • Card-Based • Touch-First  
**Sync Strategy:** Local-First • Offline-Ready • LAN Synchronization (100% Back-Office Parity)

---

## 1. Modern UI/UX Design Philosophy
The mobile application follows a **Glassmorphism-inspired interface** to provide a clean and futuristic feel.

### ✨ Visual Principles
- **Translucent surfaces:** `bg-white/10`, `backdrop-blur-xl`
- **Smooth geometry:** `rounded-2xl`, `rounded-3xl`, soft shadows
- **Large readable typography:** Inter/Roboto
- **Haptic feedback:** Light vibration for press actions
- **Dark Mode First:** Deep backgrounds (`bg-slate-900`) with bright accents (`text-sky-400`)

---

## 2. Role-Based Page Structure
The app handles both **Cashier** and **Admin** roles from a single APK. Access permissions come from `users.json`.

### 2.1 Cashier Pages (Daily Operations)
- Login (PIN-based)
- POS / Product Grid
- Checkout
- Transactions (Recent receipts)
- Expenses
- Credit Customers
- Closing (Shift Summary)

### 2.2 Admin Pages (Management)
- Connection Setup
- Sync Monitor
- Settings (Printer, Debug, Device Info)

---

## 3. Detailed Page Specifications

### 3.1 Connection Screen (Setup)
**Design:** Floating glass card over blurred background.  
**Features:**
- QR Code Scan (Auto-fill URL + Key)
- Manual Setup (URL / Mobile Sync Key)
- Connection badge (Green/Red)

**Logic:**
- On successful connection → Save to `localStorage`, perform **Full Pull**, redirect to Login.

---

### 3.2 Login Screen (Glassmorphic)
**First Time:** Avatar list → Tap to choose user → Enter PIN.  
**Returning:** "Welcome back, [Name]" with Switch User.

**PIN Pad:**
- Circular frosted buttons
- Haptic feedback
- Show/Hide toggle

---

### 3.3 POS Dashboard (Main Screen)
**Layout:**
- Top Bar → Name (left), Connection + Sync Indicators (right)
- Category Pills → Horizontal scroll
- Product Grid → 2-column mobile / 3-column tablet

**Product Card Contains:**
- Product Image
- Product Name (bold)
- Price
- Stock badge

**Interaction:**
- Tap → Add to cart
- Long Press → Show details

**Cart:**
- Bottom bar: “X items • Total KES Y” → tap to expand sheet

---

### 3.4 Checkout Modal
**Payment Methods:**
- CASH
- M-PESA
- CREDIT

**Logic:**
- Confirm → Create Transaction Object
- Send to Desktop API `/api/print-receipt`
- Queue sync event

---

### 3.5 Expenses Page
- List of today's expenses
- "+" Floating Action Button
- Modal → Amount, Category, Description
- Queue: `add-expense`

---

### 3.6 Credit Customers
- Search list (Name + Balance)
- Add Customer
- Pay Debt Modal
- Queued operations: `add-credit-customer`, `update-credit-customer`

---

### 3.7 Admin Settings / Sync Monitor
- Pending queue count
- Last sync time
- Printer test
- Disconnect button
- Sync logs

---

## 4. Data Synchronization Protocol
The app uses the same Desktop-to-Cloud sync format but via **LAN (Local WiFi)**.

### 4.1 Architecture
- **Server:** Desktop POS (Electron/Express @ Port 3000)
- **Client:** Mobile App (Capacitor)
- **Transport:** HTTP JSON over LAN

### 4.2 Sync Lifecycle
1. Load → Check saved credentials
2. Detect online/offline events
3. **PULL:** `/api/sync` → refresh products & users
4. **PUSH:** Queue operations → batch POST
5. Retry every 1 minute, or when back online

---

## 5. Desktop Server Requirements
Desktop (`electron.cjs`) must:
1. Expose `/api/sync` for batch operations
2. Support operation types: `transaction`, `expense`, `customer`, `product`, `user`
3. Serve images via: `http://<IP>:3000/assets/...`
4. Generate QR Code with `{ apiUrl, apiKey }`

---

## 6. Setup Instructions
1. Desktop → `Manage > Devices`
2. Ensure QR Code appears for mobile connection
3. Install APK
4. Mobile → Scan QR or enter details manually
5. Login using Cashier PIN

---

## 7. Branding, App Name & Assets

### 7.1 Application Name
The official mobile app name is:

> **Whiz Pos**  
*(not "WHIZ POS")*

### 7.2 Icons & Logo Assets
Preferred order:
- `logo.png` (primary)
- `logo.svg` (scalable for splash + icons)
- `logo.ico` (fallback)

Used for:
- App launcher icon
- Splash screen
- Headers / Login

### 7.3 Default Product Placeholder
If a product has no image, display:
- `cart.png` *(primary placeholder)*
- or `cart.svg` *(vector fallback)*

Used in:
- Product Grid
- Cart items
- Search results
- Product detail modal

### 7.4 Image Delivery
All assets served from Desktop:
```
http://<DESKTOP-IP>:3000/assets/<file>
```

---

If you'd like, I can also generate:
- A flow diagram
- UI mockups for each page
- A full API reference
- A version of this README optimized for GitHub or documentation sites
