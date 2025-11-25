<p align="center">
  <img src="./assets/logo.png" width="160" />
</p>

<h1 align="center">✨ WHIZ POS ✨</h1>

<p align="center">
  <strong>A modern, offline-first, full-feature Point of Sale ecosystem for cafés, restaurants & retail.</strong><br/>
  Desktop POS • Back Office Web Dashboard • Mobile Ordering App
</p>

<p align="center">
  <a href="#"><img alt="Node" src="https://img.shields.io/badge/Node.js-18%2B-43853D?style=for-the-badge&logo=node.js&logoColor=white"/></a>
  <a href="#"><img alt="Electron" src="https://img.shields.io/badge/Electron-App-2C2E3B?style=for-the-badge&logo=electron&logoColor=white"/></a>
  <a href="#"><img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Database-4DB33D?style=for-the-badge&logo=mongodb&logoColor=white"/></a>
</p>

---

## 🌟 Overview

**WHIZ POS** is a complete ecosystem designed to streamline business operations for cafés, restaurants, shops, and retail outlets.
It is **fast**, **beautiful**, **offline-ready**, and **built for real-world business workflows.**

The system consists of:

| Component | Tech | Purpose |
|----------|------|---------|
| **Desktop POS (Electron/React)** | Electron + React + TypeScript | Fast cashier interface, offline-first transactions, receipt printing |
| **Back Office Web (Node/Express)** | Node.js + MongoDB + EJS | Business analytics, inventory, expenses, credit management |
| **Mobile App (Capacitor/React)** | Hybrid Android App | Take orders remotely, sync instantly with POS |

---

## 🚀 Features

### 🛒 **Point of Sale**
- Lightning-fast checkout
- Cash / M-Pesa / Credit payments
- Instant receipt printing

### 📦 **Inventory Management**
- Live stock tracking
- Automatic low-stock notifications
- Bulk product management

### 💸 **Expense Tracking**
- Categorized expenses
- Daily, weekly & monthly summaries

### 👥 **Credit/Customer Management**
- Customer credit limits
- Partial payments
- Transaction history

### 📊 **Reporting & Analytics**
- Daily sales
- Closing summaries
- Product performance

### 🔌 **Offline-First Sync**
- POS works 100% offline
- Auto-sync to Back Office when reconnecting

### 📱 **Mobile Integration**
- Local API printing
- Remote order sending

---

## 🧱 Architecture Diagram

<details>
<summary><strong>Click to Expand 🖼️</strong></summary>

```
 ┌───────────────────────┐
 │    Mobile App         │
 │  (Capacitor/React)    │
 └───────────┬───────────┘
             │
             ▼
 ┌───────────────────────┐
 │   Desktop POS (Electron)  
 │   - Offline queueing
 │   - Local JSON store
 └───────────┬───────────┘
             │ Sync API
             ▼
 ┌────────────────────────┐
 │   Back Office (Node.js)
 │   - MongoDB Database
 │   - API & Dashboard
 └────────────────────────┘
```

</details>

---

## ⚙️ Installation & Setup

### 📌 Prerequisites
- Node.js **v18+**
- MongoDB (Local or Atlas)

---

### 🖥️ **1. Desktop POS Setup**

```bash
git clone <repo>
npm install
npm run dev
```

Starts both Vite (React) and Electron processes.

---

### 🌐 **2. Back Office Setup**

```bash
cd back-office
npm install
```

Create **.env**:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whizpos
SESSION_SECRET=your_secret_key
API_KEY=your_secure_api_key
BUSINESS_NAME=My Business
```

Start:
```bash
npm run dev
```

---

### 🔗 **3. Connect Desktop POS to Back Office**

1. Open Desktop POS  
2. Go to **Manage → Devices & Connections**  
3. Enter Back Office URL + `API_KEY`  
4. Save  
5. Run **Sync Local Data to Cloud**

---

## 🧑‍💼 Usage Guide

### 🛍️ Processing Sales
- Tap items → Add to cart  
- **Checkout → choose payment method**  
- For credit: choose/add customer  

### 📘 End-of-Day Closing
- Go to **Closing**  
- Review totals: Cash, M-Pesa, Credit  
- Print **Closing Report**  

### 🔄 Synchronization
- Auto-sync runs in background  
- If offline → queues locally  
- Syncs the moment connection is restored  

---

## 🛠️ Development Notes

| Area | Path |
|------|------|
| Electron Main | `electron.cjs` |
| Preload | `preload.js` |
| Frontend (React) | `src/` |
| Back Office (Node) | `back-office/` |

---

## 📄 License

**Proprietary software — Whiz Tech**

📞 Contact: **0740-841-168**  
📧 (Add email if needed)

---

<p align="center">
  Made with ❤️ by <strong>Whiz Tech</strong>
</p>
