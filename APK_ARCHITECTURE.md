# WHIZ POS Mobile App (APK) - Modern Architecture & Design Guide

**Version:** 2.0.0 (Modern UI Overhaul)
**Target Platform:** Android 5.0+ (Lollipop) to Android 14+
**Design Language:** Modern, Glassmorphic, Card-Based, Touch-First
**Sync Strategy:** Local-First, Offline-Ready, LAN Synchronization (100% Back-Office Parity)

---

## 1. Modern UI/UX Design Philosophy

The mobile application uses a **"Glassmorphism"** design language to provide a modern, professional feel.

*   **Visual Style:** Translucent backgrounds (`bg-white/10`, `backdrop-blur`), rounded corners (`rounded-2xl`, `rounded-3xl`), and soft shadows.
*   **Typography:** Clean, sans-serif fonts (Inter/Roboto). Large, readable text for high-paced retail environments.
*   **Interactions:** Haptic feedback on touches (vibrations), smooth transitions between screens, and "active" states for buttons (scaling down on press).
*   **Dark Mode:** The app defaults to a dark/deep blue theme (`bg-slate-900`) with bright accents (`text-sky-400`) for low-light contrast and battery saving on OLED screens.

---

## 2. Role-Based Page Structure

The application logic distinguishes between **Cashier** and **Admin** functions, though they share the same app installation. Access is controlled via User Role (stored in `users.json`).

### 2.1. Cashier Pages (Day-to-Day Operations)
These pages are optimized for speed and efficiency.
*   **Login:** PIN-based entry.
*   **POS (Point of Sale):** Product grid, search, cart.
*   **Checkout:** Payment processing.
*   **Transactions:** View recent sales (for reprints).
*   **Expenses:** Log shop expenses.
*   **Credit Customers:** Manage customer tabs.
*   **Closing:** End-of-shift summary.

### 2.2. Admin Pages (Configuration & Management)
These pages are for setup and monitoring.
*   **Connection Setup:** Initial server pairing.
*   **Sync Monitor:** Detailed sync logs and "Force Push".
*   **Settings:** Printer configuration, detailed debugging.

---

## 3. Detailed Page Specifications

### 3.1. Connection Screen (Setup)
*   **Design:** Central "Connect" card floating on a blurred background.
*   **Features:**
    *   **QR Code Scanner:** A prominent button that opens the camera to scan the QR code displayed on the Desktop POS (`Manage > Devices`). This auto-fills the URL and Key.
    *   **Manual Entry:** Fallback input fields for "Desktop Server URL" and "Mobile Sync Key".
    *   **Status Indicator:** A "Test Connection" badge that turns Green/Red.
*   **Logic:**
    *   On success: Saves credentials to `localStorage`. Triggers immediate *Full Pull*. Redirects to Login.

### 3.2. Login Screen (Glassmorphic)
*   **Design:**
    *   **First Time:** A beautiful grid/list of user avatars. Tapping one prompts for PIN.
    *   **Persistent:** Shows "Welcome back, [Name]" with a "Switch User" option.
    *   **PIN Pad:** Large, circular, frosted-glass number buttons. "Show/Hide" toggle for PIN visibility.
*   **Logic:**
    *   Validates PIN against local database.
    *   Stores `currentCashier` in global state.

### 3.3. POS Dashboard (The Core)
*   **Layout:**
    *   **Top Bar:** Business Name (Left), Connection Status (Right - Wifi Icon), Sync Indicator (Rotating arrows).
    *   **Category Pills:** Horizontal scrollable list of categories. Active category is highlighted.
    *   **Product Grid:** 2-column (mobile) or 3-column (tablet) grid.
        *   **Product Card:** Image (top), Name (bold), Price (accent color), Stock Level (small badge).
        *   **Interaction:** Tapping adds 1 to cart. Long-press shows details.
    *   **Floating Cart Action:** A bottom bar showing "X items • Total KES Y" that expands into the Cart sheet.

### 3.4. Checkout Modal
*   **Design:** Slide-up bottom sheet.
*   **Payment Methods:** Large, touch-friendly cards for **CASH**, **M-PESA**, **CREDIT**.
    *   **Cash:** Quick "Exact Amount" button.
    *   **M-Pesa:** Input for Phone Number (optional).
    *   **Credit:** Search bar to find Credit Customer.
*   **Logic:**
    *   On confirm: Generates `Transaction` object.
    *   **Print:** Sends `POST /api/print-receipt` to Desktop.
    *   **Sync:** Queues `new-transaction` operation.

### 3.5. Expenses Page
*   **Design:** List of today's expenses with a "+" Floating Action Button (FAB).
*   **Add Expense Modal:**
    *   Form fields for Amount, Description, Category (Dropdown).
*   **Logic:** Queues `add-expense` operation.

### 3.6. Credit Customers Page
*   **Design:** Searchable list of customers showing "Name" and "Current Balance" (Red if debt, Green if credit).
*   **Actions:**
    *   **Add Customer:** Simple form (Name, Phone).
    *   **Pay Debt:** Modal to accept payment and reduce balance.
*   **Logic:** Queues `add-credit-customer` or `update-credit-customer`.

### 3.7. Admin Settings / Sync Monitor
*   **Design:** List of technical details.
*   **Sections:**
    *   **Sync Status:** "Pending Items: 0", "Last Sync: Just now".
    *   **Printer:** "Test Print" button.
    *   **Connection:** "Disconnect" (Logout) button.
    *   **Logs:** View recent sync errors.

---

## 4. Data Synchronization Protocol (Back-Office Parity)

The app mirrors the Desktop-to-Cloud protocol but over LAN.

### 4.1. Architecture
*   **Server:** Desktop POS (Electron) running Express on Port 3000.
*   **Client:** Mobile App (Capacitor).
*   **Network:** Local WiFi.

### 4.2. Sync Lifecycle
1.  **Initialization:** App loads. Checks `localStorage` for credentials.
2.  **Connectivity:** Listens for `window.online` / `offline`.
3.  **Pull (Startup):** Calls `GET /api/sync`. Replaces local `products.json` and `users.json` in-memory.
4.  **Push (Mutation):**
    *   User performs action (Sale).
    *   App adds Operation `{ type: 'new-transaction', data: ... }` to `syncQueue`.
    *   App attempts to flush queue via `POST /api/sync`.
    *   **Retry Policy:** If offline/fail, keep in queue. Retry every 1 min or on "Online" event.

---

## 5. Server-Side Configuration (Desktop)

To support this Modern APK, the Desktop App (`electron.cjs`) has been updated to:
1.  Expose `POST /api/sync` accepting batch operations.
2.  Handle all operation types: `transaction`, `expense`, `customer`, `product`, `user`.
3.  Serve product images via `http://<IP>:3000/assets/...`.
4.  Generate QR Codes containing `{ "apiUrl": "...", "apiKey": "..." }`.

---

## 6. Setup Instructions

1.  **Desktop:** Go to `Manage > Devices`.
2.  **Desktop:** Ensure "Mobile App Connection" shows a QR Code.
3.  **Mobile:** Install APK.
4.  **Mobile:** Tap "Scan QR Code" (or enter details manually).
5.  **Mobile:** Login with Cashier PIN.
