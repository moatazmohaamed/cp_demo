import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { FinancialBreakdown } from '../../models/financial-breakdown.model';

@Component({
  selector: 'app-financial-details-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TuiIcon],
  templateUrl: './financial-details-modal.component.html',
  styleUrl: './financial-details-modal.component.scss'
})
export class FinancialDetailsModalComponent {
  isOpen = input<boolean>(false);
  financials = input<FinancialBreakdown | null>(null);
  orderId = input<number>(0);
  paymentStatus = input<string>('pending');
  invoiceId = input<string>('');
  close = output<void>();

  // Tab management
  activeTab: 'financial' | 'breakdown' | 'items' | 'history' = 'financial';
  
  // Export state
  isExporting = false;

  getTotalTaxableAmount(): number {
    const fin = this.financials();
    if (!fin) return 0;
    return fin.lineItems.filter(item => item.taxable).reduce((sum, item) => sum + item.total, 0);
  }

  calculateLineItemTotal(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }

  getPercentageOfTotal(amount: number): number {
    const fin = this.financials();
    if (!fin || fin.totalAmount === 0) return 0;
    return Math.round((amount / fin.totalAmount) * 100);
  }

  getPaidAmount(): number {
    const fin = this.financials();
    if (!fin) return 0;
    return fin.totalAmount - fin.outstandingBalance;
  }

  getDepositPercentage(): number {
    const fin = this.financials();
    if (!fin || !fin.deposits || fin.deposits.length === 0) return 0;
    const totalDeposits = fin.deposits.reduce((sum, d) => sum + d.depositAmount, 0);
    return Math.round((totalDeposits / fin.totalAmount) * 100);
  }

  onClose(): void {
    this.close.emit();
  }

  /**
   * Exports invoice as CSV format
   * Generates a comprehensive financial report with all details
   */
  exportInvoiceAsCSV(): void {
    const fin = this.financials();
    if (!fin) {
      console.error('No financial data available for export');
      return;
    }

    this.isExporting = true;

    try {
      const csvContent = this.generateInvoiceCSV(fin);
      this.downloadFile(csvContent, `invoice-${this.invoiceId()}.csv`, 'text/csv');
    } catch (error) {
      console.error('Error exporting invoice:', error);
      alert('Failed to export invoice. Please try again.');
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Exports invoice as PDF format
   */
  exportInvoiceAsPDF(): void {
    const fin = this.financials();
    if (!fin) {
      console.error('No financial data available for export');
      return;
    }

    this.isExporting = true;

    try {
      // For now, we'll create an HTML representation that can be printed as PDF
      const htmlContent = this.generateInvoiceHTML(fin);
      const printWindow = window.open('', '', 'height=800,width=1000');
      
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Set a timeout to allow content to load before printing
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('Error exporting invoice as PDF:', error);
      alert('Failed to export invoice. Please try again.');
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Generates invoice in CSV format
   */
  private generateInvoiceCSV(fin: FinancialBreakdown): string {
    const rows: string[] = [];
    
    // Header information
    rows.push('INVOICE REPORT');
    rows.push(`Invoice ID,${this.invoiceId()}`);
    rows.push(`Order ID,${this.orderId()}`);
    rows.push(`Generated,${new Date().toLocaleDateString()}`);
    rows.push('');

    // Summary section
    rows.push('FINANCIAL SUMMARY');
    rows.push(`Total Amount,${this.formatCurrency(fin.totalAmount, fin.currency)}`);
    rows.push(`Amount Paid,${this.formatCurrency(fin.totalAmount - fin.outstandingBalance, fin.currency)}`);
    rows.push(`Outstanding Balance,${this.formatCurrency(fin.outstandingBalance, fin.currency)}`);
    rows.push(`Payment Status,${this.paymentStatus().toUpperCase()}`);
    rows.push('');

    // Price breakdown
    rows.push('PRICE BREAKDOWN');
    rows.push('Description,Amount,Percentage');
    rows.push(`Base Price,${this.formatCurrency(fin.basePrice, fin.currency)},100%`);
    
    if (fin.discountAmount > 0) {
      rows.push(`Discount (${fin.discountCode}),-${this.formatCurrency(fin.discountAmount, fin.currency)},-${fin.discountPercentage}%`);
    }
    
    rows.push(`Subtotal,${this.formatCurrency(fin.subtotal, fin.currency)},${this.getPercentageOfTotal(fin.subtotal)}%`);
    rows.push(`Tax (${(fin.taxRate * 100).toFixed(0)}%),${this.formatCurrency(fin.taxAmount, fin.currency)},${this.getPercentageOfTotal(fin.taxAmount)}%`);
    
    if (fin.shippingCost > 0) {
      rows.push(`Shipping,${this.formatCurrency(fin.shippingCost, fin.currency)},${this.getPercentageOfTotal(fin.shippingCost)}%`);
    }
    
    if (fin.handlingFee > 0) {
      rows.push(`Handling Fee,${this.formatCurrency(fin.handlingFee, fin.currency)},${this.getPercentageOfTotal(fin.handlingFee)}%`);
    }
    
    if (fin.insuranceFee > 0) {
      rows.push(`Insurance,${this.formatCurrency(fin.insuranceFee, fin.currency)},${this.getPercentageOfTotal(fin.insuranceFee)}%`);
    }
    
    rows.push(`TOTAL,${this.formatCurrency(fin.totalAmount, fin.currency)},100%`);
    rows.push('');

    // Line items
    rows.push('LINE ITEMS');
    rows.push('Description,Quantity,Unit Price,Total,Taxable');
    fin.lineItems.forEach(item => {
      rows.push(`${this.escapeCSV(item.description)},${item.quantity},${this.formatCurrency(item.unitPrice, fin.currency)},${this.formatCurrency(item.total, fin.currency)},${item.taxable ? 'Yes' : 'No'}`);
    });
    rows.push('');

    // Payment history
    if (fin.deposits && fin.deposits.length > 0) {
      rows.push('PAYMENT HISTORY');
      rows.push('Deposit ID,Date,Amount');
      fin.deposits.forEach(deposit => {
        rows.push(`${deposit.depositId},${new Date(deposit.depositDate).toLocaleDateString()},${this.formatCurrency(deposit.depositAmount, fin.currency)}`);
      });
    }

    return rows.join('\n');
  }

  /**
   * Generates invoice in HTML format (for PDF printing)
   */
  private generateInvoiceHTML(fin: FinancialBreakdown): string {
    const paidAmount = fin.totalAmount - fin.outstandingBalance;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 2px solid #1a6496; padding-bottom: 20px; }
    .title { font-size: 28px; font-weight: 700; color: #1a6496; }
    .subtitle { font-size: 12px; color: #999; margin-top: 4px; }
    .invoice-info { text-align: right; }
    .info-row { font-size: 13px; margin: 4px 0; }
    .label { color: #666; font-weight: 600; }
    
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .summary-card { padding: 16px; border: 1px solid #e0e0e0; border-radius: 6px; text-align: center; }
    .summary-card .value { font-size: 20px; font-weight: 700; color: #1a6496; margin: 8px 0; }
    .summary-card .label { font-size: 11px; color: #999; }
    
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    table th { background: #f5f5f5; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #333; border-bottom: 2px solid #e0e0e0; }
    table td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    table tr:hover { background: #f9f9f9; }
    
    .total-row { background: #f5f5f5; font-weight: 700; border-top: 2px solid #1a6496; }
    .total-row td { padding: 16px 12px; }
    
    .align-right { text-align: right; }
    .section-title { font-size: 14px; font-weight: 700; margin-top: 30px; margin-bottom: 12px; color: #1a6496; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #999; text-align: center; }
    
    @media print {
      body { margin: 0; padding: 0; }
      .container { margin: 0; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="title">INVOICE</div>
        <div class="subtitle">Financial Details Report</div>
      </div>
      <div class="invoice-info">
        <div class="info-row"><span class="label">Invoice:</span> ${this.invoiceId()}</div>
        <div class="info-row"><span class="label">Order:</span> #${this.orderId()}</div>
        <div class="info-row"><span class="label">Date:</span> ${new Date().toLocaleDateString()}</div>
        <div class="info-row"><span class="label">Status:</span> ${this.paymentStatus().toUpperCase()}</div>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Total Amount</div>
        <div class="value">${this.formatCurrency(fin.totalAmount, fin.currency)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Amount Paid</div>
        <div class="value">${this.formatCurrency(paidAmount, fin.currency)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Outstanding</div>
        <div class="value">${this.formatCurrency(fin.outstandingBalance, fin.currency)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Payment Status</div>
        <div class="value">${this.paymentStatus().toUpperCase()}</div>
      </div>
    </div>

    <div class="section-title">Price Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="align-right">Amount</th>
          <th class="align-right">Percentage</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Base Price</td>
          <td class="align-right">${this.formatCurrency(fin.basePrice, fin.currency)}</td>
          <td class="align-right">100%</td>
        </tr>
        ${fin.discountAmount > 0 ? `
        <tr>
          <td>Discount (${fin.discountCode})</td>
          <td class="align-right">-${this.formatCurrency(fin.discountAmount, fin.currency)}</td>
          <td class="align-right">-${fin.discountPercentage}%</td>
        </tr>
        ` : ''}
        <tr>
          <td>Subtotal</td>
          <td class="align-right">${this.formatCurrency(fin.subtotal, fin.currency)}</td>
          <td class="align-right">${this.getPercentageOfTotal(fin.subtotal)}%</td>
        </tr>
        <tr>
          <td>Tax (${(fin.taxRate * 100).toFixed(0)}%)</td>
          <td class="align-right">${this.formatCurrency(fin.taxAmount, fin.currency)}</td>
          <td class="align-right">${this.getPercentageOfTotal(fin.taxAmount)}%</td>
        </tr>
        ${fin.shippingCost > 0 ? `
        <tr>
          <td>Shipping</td>
          <td class="align-right">${this.formatCurrency(fin.shippingCost, fin.currency)}</td>
          <td class="align-right">${this.getPercentageOfTotal(fin.shippingCost)}%</td>
        </tr>
        ` : ''}
        ${fin.handlingFee > 0 ? `
        <tr>
          <td>Handling Fee</td>
          <td class="align-right">${this.formatCurrency(fin.handlingFee, fin.currency)}</td>
          <td class="align-right">${this.getPercentageOfTotal(fin.handlingFee)}%</td>
        </tr>
        ` : ''}
        ${fin.insuranceFee > 0 ? `
        <tr>
          <td>Insurance</td>
          <td class="align-right">${this.formatCurrency(fin.insuranceFee, fin.currency)}</td>
          <td class="align-right">${this.getPercentageOfTotal(fin.insuranceFee)}%</td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td>TOTAL AMOUNT DUE</td>
          <td class="align-right">${this.formatCurrency(fin.totalAmount, fin.currency)}</td>
          <td class="align-right">100%</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">Line Items</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="align-right">Quantity</th>
          <th class="align-right">Unit Price</th>
          <th class="align-right">Total</th>
          <th class="align-right">Taxable</th>
        </tr>
      </thead>
      <tbody>
        ${fin.lineItems.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="align-right">${item.quantity}</td>
          <td class="align-right">${this.formatCurrency(item.unitPrice, fin.currency)}</td>
          <td class="align-right">${this.formatCurrency(item.total, fin.currency)}</td>
          <td class="align-right">${item.taxable ? 'Yes' : 'No'}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    ${fin.deposits && fin.deposits.length > 0 ? `
    <div class="section-title">Payment Deposits</div>
    <table>
      <thead>
        <tr>
          <th>Deposit ID</th>
          <th class="align-right">Date</th>
          <th class="align-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${fin.deposits.map(deposit => `
        <tr>
          <td>${deposit.depositId}</td>
          <td class="align-right">${new Date(deposit.depositDate).toLocaleDateString()}</td>
          <td class="align-right">${this.formatCurrency(deposit.depositAmount, fin.currency)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="footer">
      <p>This is an automatically generated invoice. For questions, please contact support.</p>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Downloads file with specified content
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Formats currency value
   */
  private formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Escapes CSV values with special characters
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
