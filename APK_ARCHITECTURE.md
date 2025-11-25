<p align="center">
  <img src="./assets/logo.png" width="140" />
</p>

<h1 align="center">🚀 Whiz Pos Mobile App (APK)<br/>Modern Architecture • UX • Integration Guide</h1>

<p align="center">
  <strong>Version 2.0.0 — Fully Modernized UI • LAN Sync • Glassmorphic Design</strong><br/>
  Android 5.0 → 14 • Offline-First • Local-First Sync • Touch-First Experience
</p>

---

# 🌟 1. Modern UI/UX Design Philosophy
Whiz Pos Mobile features a **full modern redesign** built around clarity, speed, and beauty.

### 🎨 Visual Aesthetic
- Glassmorphism surfaces (`bg-white/10`, `backdrop-blur-xl`)
- Smooth shapes (`rounded-2xl`, `rounded-3xl`)
- Soft shadows & layered depth
- Minimal chrome; content-first layout

### 🖋 Typography
- Inter / Roboto for clean readability
- Large titles, bold product names, accessible font sizes

### ⚡ Interactions & Motion
- Haptic feedback for all key actions
- Smooth transitions between screens
- Press states (scale-down, glow effects)
- 60fps animations on all supported devices

### 🌙 Dark Mode First
- Deep slate backgrounds (`bg-slate-900`)
- Neon accent colors (`text-sky-400`, `text-emerald-300`)
- OLED-friendly battery-efficient palette

---

# 👥 2. Role-Based Structure
The app includes one APK with multiple roles.

## 2.1 Cashier (Fast-Action Mode)
Everything optimized for speed:
- 🔐 PIN Login
- 🛒 POS / Product Grid
- 💳 Checkout
- 🧾 Transactions & Reprints
- 💸 Expense Logging
- 👤 Customer Credit
- 📘 Closing / End-of-Shift Summary

## 2.2 Admin (Management Mode)
Advanced utilities:
- 🔧 Connection Setup
- 🔄 Sync Monitor
- 🖨 Printer & Debug Settings
- 📡 Device Info

---

# 🧩 3. Detailed Screen Specifications

## 3.1 🔗 Connection Screen
**Modern floating connect-card** over a blurred gradient.

### Features

### 🌓 Theme Support
- **Automatic System Theme Detection** – App switches between **light** and **dark** mode based on the device settings.
- **Manual Theme Switcher** – Option for users to force **Light Mode**, **Dark Mode**, or **Auto**.
- **Vibrant Color Palette** – Modern, bright UI with smooth transitions.

### 📱 Permissions & Device Capabilities
- Uses **Capacitor Permissions API**.
- Requests camera access for future features like QR scanning.
- Handles safe permission prompts with fallback UI.

---


### 🌓 Theme Support
- **Automatic System Theme Detection** – App switches between **light** and **dark** mode based on the device settings.
- **Manual Theme Switcher** – Option for users to force **Light Mode**, **Dark Mode**, or **Auto**.
- **Vibrant Color Palette** – Modern, bright UI with smooth transitions.

### 📱 Permissions & Device Capabilities
- Uses **Capacitor Permissions API**.
- Requests camera access for future features like QR scanning.
- Handles safe permission prompts with fallback UI.

---

- 📷 **QR Scan** → auto-fill URL + key
- ✍️ Manual entry (URL + Sync Key)
- 🟢 Status indicator with live connectivity test

### Logic
1. Scan/enter details
2. Save to secure storage
3. Perform **Full Pull**
4. Redirect to Login

---

## 3.2 🔐 Login Screen
### First Time
- Beautiful avatar grid
- Tap → enter PIN

### Returning User
- "Welcome back, *Name*"
- Switch User option

### PIN Pad
- Circular frosted buttons
- Haptic feedback
- Show/Hide toggle

---

## 3.3 🛒 POS Dashboard
### Layout
- Top bar → Business name + sync status
- Category Pills (horizontal scroll)
- Product Grid (2-column mobile / 3-column tablet)

### Product Card
- Image
- Name (bold)
- Price
- Stock badge

### Interactions
- Tap → Add to cart
- Long press → Product details

### Cart
A floating bottom bar:
```
[X items • KES Y]
```
Expands to full sheet.

---

## 3.4 💳 Checkout Modal
Slide-up sheet with large touch-friendly buttons.

### Payment Modes
- 🟩 CASH
- 🟦 M-PESA
- 🟧 CREDIT

### Logic
1. Generate new transaction
2. Send to Desktop `/api/print-receipt`
3. Add to sync queue

---

## 3.5 💸 Expenses Page
- List view of today's expenses
- "Add" FAB button
- Modal → Amount, Category, Description
- Sync queue: `add-expense`

---

## 3.6 👤 Credit Customers
- Searchable customer list
- Add customer modal
- Pay Debt modal
- Sync queue operations

---

## 3.7 🛠 Admin / Sync Monitor
- Sync status summary
- Queue count
- Printer test
- Disconnect
- View logs

---

# 🔄 4. Data Sync Protocol (LAN)
The mobile app uses the **same sync structure as Desktop → Cloud**, but via LAN.

## 4.1 Architecture
- Desktop → Express server on Port 3000
- Mobile → Capacitor app
- Transport → Local WiFi HTTP

## 4.2 Sync Lifecycle
1. Load → Check saved credentials
2. Detect online/offline
3. **PULL:** `/api/sync`
4. **PUSH:** batch operations
5. Retry every 60s or on reconnect

---

# 🖥 5. Desktop Server Requirements
Desktop POS must:
1. Expose `/api/sync` (batch ops)
2. Handle ops: transaction, expense, product, user, customer
3. Serve images from:
```
http://<IP>:3000/assets/<file>
```
4. Generate QR containing `{ apiUrl, apiKey }`

---

# 📱 6. Setup Instructions
1. Desktop → Manage → Devices
2. Confirm QR is visible
3. Install APK on mobile
4. Tap **Scan QR Code**
5. Login using PIN

---

# 🎨 7. Branding, App Name & Assets

## 7.1 App Name
Use:
```
Whiz Pos
```
*(not "WHIZ POS")*

## 7.2 Icon & Logo Sources
- `logo.png` → Primary app icon
- `logo.svg` → Splash screen + high-res scaling
- `logo.ico` → Fallback

Used in:
- Launcher icon
- Splash
- Login screen
- Top headers

## 7.3 Product Image Placeholder
If product has no assigned image, app uses:
- `cart.png` (primary placeholder)
- `cart.svg` (vector fallback)

Used in:
- Product Grid
- Cart List
- Search Results
- Details Card

## 7.4 Image Delivery Endpoint
```
http://<DESKTOP-IP>:3000/assets/<filename>
```

---

<p align="center">
  Made with ❤️ for speed, beauty, and real-world retail use.
</p>
