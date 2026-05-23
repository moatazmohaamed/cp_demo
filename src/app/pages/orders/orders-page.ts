import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiIcon } from '@taiga-ui/core';

import { Order } from '../../models/order.model';
import { MOCK_ORDERS } from '../../data/mock-orders';
import { StatusHistoryModalComponent } from '../../components/status-history-modal/status-history-modal.component';
import { FinancialSummaryComponent } from '../../components/financial-summary/financial-summary.component';
import { FinancialDetailsModalComponent } from '../../components/financial-details-modal/financial-details-modal.component';

type SortField = keyof Order | null;
type SortOrder = 'asc' | 'desc' | null;

interface ColumnDefinition {
  key: keyof Order;
  label: string;
  visible: boolean;
}

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiIcon,
    CurrencyPipe,
    StatusHistoryModalComponent,
    FinancialSummaryComponent,
    FinancialDetailsModalComponent,
  ],
  templateUrl: './orders-page.html',
  styleUrl: './order-page.scss',
})
export class OrdersPageComponent {
  readonly allOrders = signal<Order[]>(MOCK_ORDERS);
  
  // Filters
  readonly searchQuery = signal('');
  readonly selectedStatus = signal('All');
  readonly selectedDuration = signal('All');
  readonly selectedScanCenter = signal('All scan centers');
  readonly customDateFrom = signal('');
  readonly customDateTo = signal('');

  // Pagination
  readonly currentPage = signal(1);
  readonly pageSize = signal(5);
  readonly pageSizeOptions = [5, 10, 25, 50, 100];

  // Sorting
  readonly sortField = signal<SortField>(null);
  readonly sortOrder = signal<SortOrder>(null);

  // Selection
  readonly checkedOrders = signal(new Set<number>());

  // Column visibility dropdown
  readonly showColumnDropdown = signal(false);

  // Search input (immediate) vs debounced query
  readonly searchInput = signal('');

  // ========== Status History Modal ==========
  readonly statusHistoryModalOpen = signal(false);
  readonly selectedOrderForModal = signal<Order | null>(null);

  // ========== Financial Details Modal ==========
  readonly financialDetailsModalOpen = signal(false);
  readonly selectedOrderForFinancials = signal<Order | null>(null);

  // Page range for "Showing X - Y of Z"
  readonly pageStart = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  readonly pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalOrders()));

  // Expanded sub-services tracking
  readonly expandedOrders = signal(new Set<number>());

  toggleExpand(orderId: number): void {
    const updated = new Set(this.expandedOrders());
    if (updated.has(orderId)) {
      updated.delete(orderId);
    } else {
      updated.add(orderId);
    }
    this.expandedOrders.set(updated);
  }

  getSubServiceTotal(order: Order): number {
    return order.subServices.reduce((sum, svc) => sum + svc.unitPrice * svc.quantity, 0);
  }

  getSubServiceStatusCount(order: Order, status: string): number {
    return order.subServices.filter((s) => s.status === status).length;
  }

  // ========== Sub-Service Card Methods ==========
  getSubServiceInitials(assignedTo: string): string {
    if (!assignedTo || assignedTo === '—') return '—';
    const parts = assignedTo.trim().split(' ');
    return parts.map((part) => part.charAt(0).toUpperCase()).slice(0, 2).join('');
  }

  isSubServiceOverdue(svc: any): boolean {
    if (!svc.dueDate) return false;
    try {
      const dueDate = new Date(svc.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return svc.status !== 'Completed' && dueDate < today;
    } catch {
      return false;
    }
  }

  getAccentBarColor(status: string): string {
    switch (status) {
      case 'Completed':
        return 'accent-bar--completed';
      case 'In Progress':
        return 'accent-bar--in-progress';
      case 'Pending':
        return 'accent-bar--pending';
      default:
        return 'accent-bar--pending';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'status-pill--completed';
      case 'In Progress':
        return 'status-pill--in-progress';
      case 'Pending':
        return 'status-pill--pending';
      default:
        return 'status-pill--pending';
    }
  }

  getSubServiceProgressPercent(order: Order): number {
    if (order.subServices.length === 0) return 0;
    const completed = this.getSubServiceStatusCount(order, 'Completed');
    return Math.round((completed / order.subServices.length) * 100);
  }

  getSubServiceInProgressCount(order: Order): number {
    return order.subServices.filter((s) => s.status === 'In Progress').length;
  }

  getSubServicePendingCount(order: Order): number {
    return order.subServices.filter((s) => s.status === 'Pending').length;
  }

  formatCardIndex(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  // ========== Status History Modal Methods ==========
  openStatusHistoryModal(order: Order): void {
    this.selectedOrderForModal.set(order);
    this.statusHistoryModalOpen.set(true);
  }

  closeStatusHistoryModal(): void {
    this.statusHistoryModalOpen.set(false);
    this.selectedOrderForModal.set(null);
  }

  // ========== Financial Details Modal Methods ==========
  openFinancialDetailsModal(order: Order): void {
    this.selectedOrderForFinancials.set(order);
    this.financialDetailsModalOpen.set(true);
  }

  closeFinancialDetailsModal(): void {
    this.financialDetailsModalOpen.set(false);
    this.selectedOrderForFinancials.set(null);
  }

  // Column visibility
  readonly columns = signal<ColumnDefinition[]>([
    { key: 'id', label: '#', visible: true },
    { key: 'scanCenter', label: 'Scan center', visible: true },
    { key: 'doctor', label: 'Doctor', visible: true },
    { key: 'patientName', label: 'Patient name', visible: true },
    { key: 'isLocked', label: 'Locked', visible: true },
    { key: 'notes', label: 'Notes', visible: true },
    { key: 'archiveDate', label: 'Archive date', visible: true },
    { key: 'orderType', label: 'Order', visible: true },
    { key: 'billTo', label: 'Bill to', visible: true },
    { key: 'maxillary', label: 'Max.', visible: true },
    { key: 'mandibular', label: 'Mand.', visible: true },
    { key: 'format', label: 'Format', visible: true },
    { key: 'amountBilled', label: 'Amount billed', visible: true },
    { key: 'vouchers', label: 'Vouchers', visible: true },
    { key: 'receivedTime', label: 'Received time', visible: true },
    { key: 'sentTime', label: 'Sent time', visible: true },
    { key: 'updateTime', label: 'Update time', visible: true },
    { key: 'updateStatus', label: 'Update status', visible: true },
    { key: 'chargedOn', label: 'Charged on', visible: true },
    { key: 'action', label: 'Action', visible: true },
    { key: 'changeRequest', label: 'Change request', visible: true },
    { key: 'csTask', label: 'CS task', visible: true },
    { key: 'orderStatus', label: 'Order Status', visible: false },
    { key: 'paymentStatus', label: 'Payment Status', visible: true },
    { key: 'shippingTier', label: 'Shipping Tier', visible: false },
    { key: 'invoiceId', label: 'Invoice ID', visible: false },
  ]);

  readonly visibleColumns = computed(() =>
    this.columns().filter((col) => col.visible)
  );

  readonly visibleColumnCount = computed(() => this.visibleColumns().length);

  readonly statusOptions = ['All', 'No Updates', 'Updated', 'Pending'];
  readonly durationOptions = ['All', 'Today', 'Last 7 days', 'Last 30 days', 'Last 3 months', 'Custom range'];

  // ========== Financial Analytics ==========
  readonly totalRevenue = computed(() =>
    this.filteredAndSortedOrders().reduce((sum, o) => sum + o.financials.totalAmount, 0)
  );

  readonly outstandingBalance = computed(() =>
    this.filteredAndSortedOrders().reduce((sum, o) => sum + o.financials.outstandingBalance, 0)
  );

  readonly paidAmount = computed(() => this.totalRevenue() - this.outstandingBalance());

  readonly uniqueScanCenters = computed(() => {
    const centers = new Set<string>();
    this.allOrders().forEach((order) => {
      const center = order.scanCenter || 'None';
      centers.add(center);
    });
    return ['All scan centers', ...Array.from(centers).sort()];
  });

  private searchDebounceTimeout: any;

  readonly filteredAndSortedOrders = computed(() => {
    let orders = this.allOrders();
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();
    const duration = this.selectedDuration();
    const scanCenter = this.selectedScanCenter();

    // Apply search filter
    if (query) {
      orders = orders.filter((o) => {
        const searchableFields = [
          o.id.toString(),
          o.patientName.toLowerCase(),
          o.doctor.toLowerCase(),
          o.scanCenter.toLowerCase(),
          o.billTo.toLowerCase(),
          o.orderType.toLowerCase(),
        ];
        return searchableFields.some((field) => field.includes(query));
      });
    }

    // Apply status filter
    if (status !== 'All') {
      orders = orders.filter((o) => {
        if (status === 'Updated') return o.updateStatus !== 'No Updates' && o.updateStatus !== '';
        if (status === 'Pending') return o.chargedOn === '' || o.chargedOn === 'Not Yet';
        return o.updateStatus === status;
      });
    }

    // Apply duration filter
    if (duration !== 'All' && duration !== 'Custom range') {
      const now = new Date();
      const orderDate = new Date();
      
      switch (duration) {
        case 'Today':
          orderDate.setHours(0, 0, 0, 0);
          now.setHours(23, 59, 59, 999);
          break;
        case 'Last 7 days':
          orderDate.setDate(orderDate.getDate() - 7);
          break;
        case 'Last 30 days':
          orderDate.setDate(orderDate.getDate() - 30);
          break;
        case 'Last 3 months':
          orderDate.setMonth(orderDate.getMonth() - 3);
          break;
      }

      orders = orders.filter((o) => {
        try {
          const received = new Date(o.receivedTime);
          return received >= orderDate && received <= now;
        } catch {
          return false;
        }
      });
    }

    // Apply custom date range if applicable
    if (duration === 'Custom range' && (this.customDateFrom() || this.customDateTo())) {
      const from = this.customDateFrom() ? new Date(this.customDateFrom()) : new Date(0);
      const to = this.customDateTo() ? new Date(this.customDateTo()) : new Date(9999, 11, 31);

      orders = orders.filter((o) => {
        try {
          const received = new Date(o.receivedTime);
          return received >= from && received <= to;
        } catch {
          return false;
        }
      });
    }

    // Apply scan center filter
    if (scanCenter !== 'All scan centers') {
      orders = orders.filter((o) => (o.scanCenter || 'None') === scanCenter);
    }

    // Apply sorting
    if (this.sortField() && this.sortOrder()) {
      const field = this.sortField();
      const order = this.sortOrder();
      orders = [...orders].sort((a, b) => {
        const aVal = a[field!];
        const bVal = b[field!];

        if (aVal === null || aVal === undefined || aVal === '') {
          return order === 'asc' ? 1 : -1;
        }
        if (bVal === null || bVal === undefined || bVal === '') {
          return order === 'asc' ? -1 : 1;
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return order === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    } else {
      // Default sort: id descending
      orders = [...orders].sort((a, b) => b.id - a.id);
    }

    return orders;
  });

  readonly totalOrders = computed(() => this.filteredAndSortedOrders().length);

  readonly totalPages = computed(() =>
    Math.ceil(this.totalOrders() / this.pageSize())
  );

  readonly paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredAndSortedOrders().slice(start, end);
  });

  readonly totalBilled = computed(() =>
    this.filteredAndSortedOrders().reduce((sum, o) => sum + o.amountBilled, 0)
  );

  readonly orderCount = computed(() => this.filteredAndSortedOrders().length);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchQuery()) count++;
    if (this.selectedStatus() !== 'All') count++;
    if (this.selectedDuration() !== 'All') count++;
    if (this.selectedScanCenter() !== 'All scan centers') count++;
    return count;
  });

  readonly showPagination = computed(() => this.totalOrders() > this.pageSize());

  readonly selectedCount = computed(() => this.checkedOrders().size);

  readonly isAllOnPageChecked = computed(() => {
    if (this.paginatedOrders().length === 0) return false;
    return this.paginatedOrders().every((order) => this.checkedOrders().has(order.id));
  });

  constructor() {
    // Expand all sub-services by default
    effect(() => {
      const orderIds = this.allOrders()
        .filter(order => order.subServices.length > 0)
        .map(order => order.id);
      this.expandedOrders.set(new Set(orderIds));
    });

    // Reset to page 1 when filters change
    effect(() => {
      this.searchQuery();
      this.selectedStatus();
      this.selectedDuration();
      this.selectedScanCenter();
      this.currentPage.set(1);
      this.checkedOrders.set(new Set());
    });

    // Reset to page 1 and clear selection when page size changes
    effect(() => {
      this.pageSize();
      this.currentPage.set(1);
      this.checkedOrders.set(new Set());
    });

    // Reset to page 1 and clear selection when sort changes
    effect(() => {
      this.sortField();
      this.sortOrder();
      this.currentPage.set(1);
      this.checkedOrders.set(new Set());
    });
  }

  toggleSort(field: keyof Order): void {
    if (this.sortField() === field) {
      // Cycle: asc -> desc -> null
      if (this.sortOrder() === 'asc') {
        this.sortOrder.set('desc');
      } else if (this.sortOrder() === 'desc') {
        this.sortField.set(null);
        this.sortOrder.set(null);
      }
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }
  }

  getSortIcon(field: keyof Order): string {
    if (this.sortField() !== field) return '@tui.arrow-up-down';
    if (this.sortOrder() === 'asc') return '@tui.arrow-up';
    return '@tui.arrow-down';
  }

  toggleColumnVisibility(key: keyof Order): void {
    const visibleCount = this.columns().filter((c) => c.visible).length;
    if (visibleCount <= 5) return; // Prevent unchecking if only 5 remain

    this.columns.update((cols) =>
      cols.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  }

  toggleCheckRow(id: number): void {
    const updated = new Set(this.checkedOrders());
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    this.checkedOrders.set(updated);
  }

  toggleCheckAll(): void {
    if (this.isAllOnPageChecked()) {
      const updated = new Set(this.checkedOrders());
      this.paginatedOrders().forEach((order) => updated.delete(order.id));
      this.checkedOrders.set(updated);
    } else {
      const updated = new Set(this.checkedOrders());
      this.paginatedOrders().forEach((order) => updated.add(order.id));
      this.checkedOrders.set(updated);
    }
  }

  clearSelection(): void {
    this.checkedOrders.set(new Set());
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('All');
    this.selectedDuration.set('All');
    this.selectedScanCenter.set('All scan centers');
    this.customDateFrom.set('');
    this.customDateTo.set('');
  }

  onSearchChange(value: string): void {
    this.searchInput.set(value);
    clearTimeout(this.searchDebounceTimeout);
    this.searchDebounceTimeout = setTimeout(() => {
      this.searchQuery.set(value);
    }, 300);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage() - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages(), startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  formatCellValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  }

  formatDate(dateStr: string): string {
    if (!dateStr || dateStr === 'No Updates' || dateStr === 'Not Yet' || dateStr === '') {
      return '—';
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
      });
    } catch {
      return '—';
    }
  }

  getDoctorInitials(doctor: string): string {
    if (!doctor) return '—';
    const name = doctor.split(' - ')[0] || doctor.split(' — ')[0];
    const parts = name.replace('Dr. ', '').split(' ');
    return parts.map((part) => part.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  getDoctorName(doctor: string): string {
    if (!doctor) return '—';
    return doctor.split(' - ')[0] || doctor.split(' — ')[0];
  }

  getDoctorClinic(doctor: string): string {
    if (!doctor) return '—';
    return doctor.split(' - ')[1] || doctor.split(' — ')[1] || '—';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Updated':
        return '@tui.check-circle';
      case 'No Updates':
        return '@tui.clock';
      case 'Pending':
        return '@tui.alert-circle';
      default:
        return '@tui.circle';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'Download':
        return '@tui.download';
      case 'Reprint':
        return '@tui.printer';
      case 'Reorder':
        return '@tui.repeat';
      default:
        return '@tui.minus';
    }
  }

  getOrderSourceIcon(source: string): string {
    switch (source) {
      case 'Connect':
        return '@tui.link';
      case 'CP':
        return '@tui.settings';
      case 'Central Tool':
        return '@tui.server';
      case 'Connect+':
        return '@tui.zap';
      default:
        return '@tui.box';
    }
  }

  getOrderSourceColor(source: string): string {
    switch (source) {
      case 'Connect':
        return 'order-source--connect';
      case 'CP':
        return 'order-source--cp';
      case 'Central Tool':
        return 'order-source--central-tool';
      case 'Connect+':
        return 'order-source--connect-plus';
      default:
        return 'order-source--default';
    }
  }

  getVipCount(): number {
    return this.filteredAndSortedOrders().filter((order) => order.isVip).length;
  }

  // ========== Financial Helper Methods ==========
  getPaymentStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'paid': 'payment-status--paid',
      'partial': 'payment-status--partial',
      'pending': 'payment-status--pending',
      'overdue': 'payment-status--overdue',
      'refunded': 'payment-status--refunded',
    };
    return statusMap[status.toLowerCase()] || 'payment-status--pending';
  }

  getPaymentStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'paid': '@tui.check-circle',
      'partial': '@tui.clock',
      'pending': '@tui.alert-circle',
      'overdue': '@tui.alert-triangle',
      'refunded': '@tui.rotate-ccw',
    };
    return iconMap[status.toLowerCase()] || '@tui.circle';
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getFinancialSummaryText(order: Order): string {
    const total = order.financials.totalAmount;
    const outstanding = order.financials.outstandingBalance;
    const paid = total - outstanding;
    
    if (outstanding === 0) {
      return `Paid in full: ${this.formatCurrency(total)}`;
    } else if (paid === 0) {
      return `Outstanding: ${this.formatCurrency(outstanding)}`;
    } else {
      return `Paid ${this.formatCurrency(paid)} of ${this.formatCurrency(total)}`;
    }
  }

  private escapeCSV(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    const str = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private getColumnValue(order: Order, columnKey: keyof Order): any {
    const value = order[columnKey];
    
    // Handle special cases
    switch (columnKey) {
      case 'patientName':
        return `${order.patientName} (${order.patientNumbering})`;
      case 'doctor':
        return this.getDoctorName(order.doctor);
      case 'orderType':
        return `${order.orderType} - ${order.orderLabel}${order.isVip ? ' (VIP)' : ''}`;
      case 'billTo':
        return `${order.billTo}${order.billToAccount ? ` - ${order.billToAccount}` : ''}`;
      case 'amountBilled':
        return `$${order.amountBilled}`;
      case 'isLocked':
        return order.isLocked ? 'Yes' : 'No';
      case 'maxillary':
      case 'mandibular':
        return value ? 'Yes' : 'No';
      case 'receivedTime':
      case 'sentTime':
      case 'updateTime':
      case 'archiveDate':
      case 'chargedOn':
        return this.formatDate(String(value));
      case 'csTask':
        if (value && typeof value === 'object' && 'id' in value) {
          const task = value as any;
          return `${task.id} (${task.status}${task.assignedDoctor ? ` - ${task.assignedDoctor}` : ''})`;
        }
        return this.formatCellValue(value);
      default:
        return this.formatCellValue(value);
    }
  }

  exportAllOrders(): void {
    const orders = this.filteredAndSortedOrders();
    if (orders.length === 0) {
      alert('No orders to export');
      return;
    }
    this.downloadCSV(orders, 'all-orders');
  }

  exportSelectedOrders(): void {
    if (this.checkedOrders().size === 0) {
      alert('No orders selected');
      return;
    }
    const selectedIds = Array.from(this.checkedOrders());
    const orders = this.filteredAndSortedOrders().filter(o => selectedIds.includes(o.id));
    this.downloadCSV(orders, 'selected-orders');
  }

  private downloadCSV(orders: Order[], filename: string): void {
    const visibleCols = this.visibleColumns();
    
    // Create header row
    const headers = visibleCols.map(col => col.label);
    const headerRow = headers.map(h => this.escapeCSV(h)).join(',');
    
    // Create data rows
    const dataRows = orders.map(order => {
      return visibleCols.map(col => {
        const value = this.getColumnValue(order, col.key);
        return this.escapeCSV(value);
      }).join(',');
    });
    
    // Combine header and data
    const csv = [headerRow, ...dataRows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
