const { app } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const qrcode = require('qrcode');

/**
 * Helper function to format a timestamp into a readable date string.
 * Format: YYYY-MM-DD HH:MM AM/PM
 *
 * @param {string|number} timestamp - The date to format.
 * @returns {string} The formatted date string.
 */
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${year}-${month}-${day} ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Generates the HTML content for a transaction receipt.
 *
 * @param {Transaction} transaction - The transaction details.
 * @param {BusinessSetup} businessSetup - The business configuration.
 * @param {boolean} isReprint - Whether this is a reprint (adds a label).
 * @returns {Promise<string>} The populated HTML string.
 */
async function generateReceipt(transaction, businessSetup, isReprint = false) {
    const templatePath = app.isPackaged
        ? path.join(app.getAppPath(), 'receipt-template.html')
        : path.join(__dirname, 'receipt-template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    template = template.replace('{{businessName}}', businessSetup?.businessName || 'WHIZ POS');
    template = template.replace('{{location}}', 'KAGWE TOWN');
    template = template.replace('{{address}}', businessSetup?.address || '');
    template = template.replace('{{phone}}', businessSetup?.phone || '');
    template = template.replace('{{receiptId}}', transaction.id + (isReprint ? ' (REPRINT)' : ''));
    template = template.replace('{{date}}', formatDate(transaction.timestamp));
    template = template.replace('{{servedBy}}', transaction.cashier);
    template = template.replace('{{paymentMethod}}', transaction.paymentMethod.toUpperCase());
    template = template.replace('{{subtotal}}', `Ksh ${transaction.subtotal.toFixed(2)}`);
    template = template.replace('{{tax}}', `Ksh ${transaction.tax.toFixed(2)}`);
    template = template.replace('{{total}}', `Ksh ${transaction.total.toFixed(2)}`);

    template = template.replace('{{receiptHeader}}', businessSetup?.receiptHeader || 'Thank you for your business!');
    template = template.replace('{{receiptFooter}}', businessSetup?.receiptFooter || 'Please come again!');

    // Generate Items HTML
    const itemsHtml = transaction.items.map(item => `
        <tr>
            <td>${item.product.name}</td>
            <td class="qty">${item.quantity}</td>
            <td class="price">${item.product.price.toFixed(2)}</td>
            <td class="total">${(item.quantity * item.product.price).toFixed(2)}</td>
        </tr>
    `).join('');
    template = template.replace('{{itemsHtml}}', itemsHtml);

    // Generate M-Pesa Details HTML if applicable
    let mpesaDetailsHtml = '';
    let details = [];

    // Check if Paybill details are present in business setup
    if (businessSetup?.mpesaPaybill) {
        details.push(`<p>Paybill No: <b>${businessSetup.mpesaPaybill}</b> | A/C No: <b>${businessSetup.mpesaAccountNumber || 'Business No'}</b></p>`);
    }

    // Check if Till details are present in business setup
    if (businessSetup?.mpesaTill) {
        details.push(`<p style="text-align: center;">Pay By Till : <b>${businessSetup.mpesaTill}</b></p>`);
    }

    if (details.length > 0) {
        mpesaDetailsHtml = `
            <div class="separator"></div>
            <div class="info">
                ${details.join('')}
            </div>
        `;
    }
    template = template.replace('{{mpesaDetails}}', mpesaDetailsHtml);

    return template;
}

/**
 * Generates the HTML content for the daily closing report.
 *
 * @param {ClosingReportData} reportData - The aggregated report data.
 * @param {BusinessSetup} businessSetup - The business configuration.
 * @returns {Promise<string>} The populated HTML string.
 */
async function generateClosingReport(reportData, businessSetup) {
    const templatePath = app.isPackaged
      ? path.join(app.getAppPath(), 'closing-report-template.html')
      : path.join(__dirname, 'closing-report-template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    template = template.replace('{{businessName}}', businessSetup?.businessName || '');
    template = template.replace('{{businessAddress}}', businessSetup?.address || '');
    template = template.replace('{{businessPhone}}', businessSetup?.phone || '');
    template = template.replace('{{date}}', new Date(reportData.date).toDateString());
    template = template.replace('{{totalCash}}', `Ksh. ${reportData.totalCash.toFixed(2)}`);
    template = template.replace('{{totalMpesa}}', `Ksh. ${reportData.totalMpesa.toFixed(2)}`);
    template = template.replace('{{totalCredit}}', `Ksh. ${reportData.totalCredit.toFixed(2)}`);
    template = template.replace('{{grandTotal}}', `Ksh. ${reportData.grandTotal.toFixed(2)}`);

    const cashierReportsHtml = reportData.cashiers.map(cashier => {
        let creditTransactionsHtml = '';
        if (cashier.creditTransactions.length > 0) {
            creditTransactionsHtml = `
                <p class="bold">Credit Transactions:</p>
                <table class="table">
                    <tbody>
                        ${cashier.creditTransactions.map(t => `
                            <tr>
                                <td class="label">${t.customerName}</td>
                                <td class="value">${t.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        return `
            <div class="cashier-section">
                <p class="bold">CASHIER: ${cashier.cashierName.toUpperCase()}</p>
                <hr>
                <table class="table">
                    <tbody>
                        <tr><td class="label">Cash Sales:</td><td class="value">Ksh. ${cashier.cashTotal.toFixed(2)}</td></tr>
                        <tr><td class="label">M-Pesa Sales:</td><td class="value">Ksh. ${cashier.mpesaTotal.toFixed(2)}</td></tr>
                        <tr><td class="label">Credit Sales:</td><td class="value">Ksh. ${cashier.creditTotal.toFixed(2)}</td></tr>
                        <tr><td class="label">Total Sales:</td><td class="value">Ksh. ${cashier.totalSales.toFixed(2)}</td></tr>
                    </tbody>
                </table>
                ${creditTransactionsHtml}
            </div>
        `;
    }).join('');
    template = template.replace('{{cashierReports}}', cashierReportsHtml);

    return template;
}

/**
 * Generates the HTML content for the initial business setup invoice.
 *
 * @param {BusinessSetup} businessSetup - The business configuration.
 * @param {User} adminUser - The admin user details.
 * @returns {Promise<string>} The populated HTML string.
 */
async function generateBusinessSetup(businessSetup, adminUser) {
    const templatePath = app.isPackaged
      ? path.join(app.getAppPath(), 'startup-invoice-template.html')
      : path.join(__dirname, 'startup-invoice-template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    template = template.replace('{{businessName}}', businessSetup?.businessName || '');
    template = template.replace('{{businessAddress}}', businessSetup?.address || '');
    template = template.replace('{{businessPhone}}', businessSetup?.phone || '');
    template = template.replace('{{adminName}}', adminUser?.name || '');
    template = template.replace('{{adminPin}}', adminUser?.pin || '');

    return template;
}

module.exports = {
  generateReceipt,
  generateClosingReport,
  generateBusinessSetup,
};
