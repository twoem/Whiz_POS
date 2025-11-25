# WHIZ POS Synchronization Documentation (SYNC.md)

## Overview

The WHIZ POS ecosystem consists of three main components that stay in sync to ensure data consistency across the business:

1.  **Desktop POS (Master)**: The primary point of sale. It holds the "source of truth" for local operations and is designed to work offline-first.
2.  **Back Office (Central Hub)**: A web-based dashboard (hosted on a server) that aggregates data, manages inventory, and provides reporting. It serves as the central sync point.
3.  **Mobile App (APK)**: A satellite POS for waiters or mobile sales. It connects to the Back Office to fetch products and push transactions.

## Sync Architecture

### 1. Desktop ↔ Back Office

The synchronization between the Desktop App and the Back Office is bidirectional but prioritizes the Desktop for conflict resolution in most cases (currently "Last Write Wins" with server timestamp check).

*   **Frequency**: Every **10 Seconds**.
*   **Protocol**: REST API (JSON).
*   **Endpoints**:
    *   `POST /api/sync`: Pushes a queue of operations (create transaction, update product, etc.) from Desktop to Back Office.
    *   `GET /api/sync`: Pulls the latest data (products, users, expenses, settings) from Back Office to Desktop.
    *   `POST /api/sync/full`: A manual "Force Sync" that overwrites the Back Office data with the Desktop's current state.

#### Logic Flow
1.  **Offline-First**: All actions on the Desktop (sales, edits) are applied locally immediately.
2.  **Queueing**: If offline, or between sync intervals, operations are added to a `syncQueue`.
3.  **Push**: Every 10s, the Desktop processes the queue. It sends operations to the server. If successful, the queue is cleared.
4.  **Pull**: Every 10s, the Desktop fetches data from the server. It compares timestamps to decide whether to update local data.

### 2. Mobile App (APK) ↔ Back Office

The Mobile App acts as a client to the Back Office.

*   **Connection**: Requires an **API Key** (generated in Desktop Settings -> Connected Devices).
*   **Sync**:
    *   Fetches Products/Menu from `/api/products`.
    *   Pushes Transactions to `/api/transaction`.
*   **Offline**: Stores transactions locally (SQLite/LocalStorage) and retries push when online.

## Data Models Synced

The following data entities are synchronized:

*   **Transactions**: Sales history, items sold, payment methods, cashier.
*   **Products**: Inventory items, prices, stock levels, images.
*   **Users**: Cashier/Manager accounts and PINs.
*   **Expenses**: Petty cash records.
*   **Credit Customers**: Customer profiles and balances.
*   **Business Settings**: Store name, receipt headers/footers, tax rates.

## Manual Sync

The **Sync Status** page in the Desktop App allows manual control:

1.  **Push Pending Data**: Immediately sends any queued local changes to the server.
2.  **Pull Updates**: Immediately checks the server for any changes made in the Back Office (e.g., price changes, new stock).
3.  **Full Cloud Synchronization**: A "Nuclear Option" that uploads the entire local database to the server, ensuring the Back Office matches the Desktop 100%. Use this after initial setup or data recovery.

## Setup & Configuration

1.  **Back Office URL**: Configured in the `.env` file or Settings.
2.  **API Key**:
    *   Generated/Found in **Back Office > Settings > Connected Devices**.
    *   Must be entered in **Desktop > Settings > Database/API**.
3.  **Firewall/Network**: Ensure port `5000` (or configured port) is open on the server if self-hosted.

## Troubleshooting

*   **"Unreachable"**: Check internet connection and Back Office URL.
*   **Sync Conflicts**: The system generally prefers the latest change. If data looks wrong, use "Full Cloud Synchronization" to reset the server to match the Desktop.
