# WHIZ POS

WHIZ POS is a modern, feature-rich Point of Sale system designed for cafés, restaurants, and retail businesses. It provides a comprehensive suite of tools for managing sales, inventory, expenses, customers, and reporting.

The system consists of three main components:
1.  **Desktop POS (Electron/React):** The primary interface for cashiers to process transactions, manage daily operations, and print receipts.
2.  **Back Office (Node.js/Express):** A web-based administration panel for owners and managers to view analytics, manage inventory remotely, and control user access.
3.  **Mobile App (Capacitor/React):** A mobile companion for taking orders and processing payments on the go (Android).

## Features

-   **Point of Sale:** Fast and intuitive checkout interface supporting Cash, M-Pesa, and Credit payments.
-   **Inventory Management:** Real-time tracking of stock levels, low stock alerts, and product management.
-   **Expense Tracking:** Record and categorize business expenses directly from the POS.
-   **Credit Management:** Track customer credit, record partial payments, and view transaction history.
-   **Reporting:** Generate detailed daily sales reports, closing reports, and sales analytics.
-   **Offline-First:** The Desktop POS works offline and synchronizes data with the Back Office when an internet connection is available.
-   **Receipt Printing:** Professional thermal receipt printing with customizable headers and footers.
-   **Mobile Integration:** Connect mobile devices to the Desktop POS to print receipts via a local API.

## Architecture

### Desktop POS (Electron)
-   **Framework:** Electron with React and TypeScript.
-   **State Management:** Zustand with persistence (local storage).
-   **Data Storage:** Local JSON files (filesystem) for offline capability.
-   **Printing:** Native Electron printing using hidden windows and HTML templates.
-   **Sync:** Queues offline operations and pushes them to the Back Office API when online.

### Back Office (Web)
-   **Framework:** Node.js with Express.
-   **Database:** MongoDB (Mongoose ODM).
-   **Templating:** EJS for server-side rendering of admin pages.
-   **API:** RESTful API for data synchronization with the Desktop POS.
-   **Authentication:** Session-based auth for web access, API Key for POS synchronization.

## Setup & Installation

### Prerequisites
-   Node.js (v18 or higher recommended)
-   MongoDB (Local or Atlas URI)

### 1. Desktop POS Setup
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    This command concurrently starts the Vite dev server and the Electron app.

### 2. Back Office Setup
1.  Navigate to the `back-office` directory:
    ```bash
    cd back-office
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `back-office` directory with the following variables:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/whizpos
    SESSION_SECRET=your_secret_key
    API_KEY=your_secure_api_key
    BUSINESS_NAME=My Business
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```

### 3. Linking Desktop and Back Office
1.  Open the Desktop POS application.
2.  Navigate to **Manage > Devices & Connections**.
3.  Enter your Back Office URL (e.g., `http://localhost:5000`) and the `API_KEY` you defined in the `.env` file.
4.  Click **Save Settings**.
5.  Click **Sync Local Data to Cloud** to perform an initial upload of your local data to the database.

## Usage

### Processing Sales
-   Add items to the cart by clicking on them in the product grid.
-   Click "Checkout" to select a payment method.
-   For **Credit** sales, select an existing customer or add a new one.

### Closing the Day
-   Go to the **Closing** tab (Admin/Manager only).
-   Review the daily totals for Cash, M-Pesa, and Credit.
-   Print the **Closing Report** for your records.

### Data Synchronization
-   The system attempts to sync automatically in the background.
-   You can monitor sync status in the **Manage** page.
-   If offline, transactions are queued and synced automatically when connection is restored.

## Development

-   **Electron Main Process:** `electron.cjs`
-   **Preload Script:** `preload.js`
-   **Frontend Source:** `src/`
-   **Back Office Source:** `back-office/`

## License
Proprietary software developed by Whiz Tech.
Contact: 0740-841-168
