import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { AuthService } from '../../services/auth.service';

interface ToothState {
  number: number;
  missing: boolean;
  implant: boolean;
}

@Component({
  selector: 'app-add-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiIcon],
  templateUrl: './add-order.component.html',
  styleUrl: './add-order.component.scss',
})
export class AddOrderComponent implements OnInit {
  form!: FormGroup;
  isRush = false;
  isDragging = false;
  selectedFile: File | null = null;

  // Dummy data
  scanCenters = ['Cairo Scan', 'Alexandria Lab', 'Giza Center'];
  doctors = ['Dr. Faraje — Novadontics', 'Dr. Ahmed Samir', 'Dr. Layla Hassan'];

  // Order types with conditional panels
  showSurgicalGuidePanel = false;
  showTempRestorationsPanel = false;
  showFinalRestorationsPanel = false;
  showTreatmentPlanPanel = false;
  showModelRegistrationPanel = false;
  showConversionPanel = false;
  showReportPanel = false;
  showMiscPanel = false;

  // Tooth chart state
  upperTeeth: ToothState[] = [];
  lowerTeeth: ToothState[] = [];

  // Notification groups
  mailToGroups = [
    { id: 'cs', label: 'CS' },
    { id: 'sales', label: 'Sales' },
    { id: 'tp', label: 'TP' },
    { id: 'ops', label: 'Ops' },
    { id: 'finance', label: 'Finance' },
    { id: 'guides', label: 'Guides' },
    { id: 'restorations', label: 'Restorations' },
    { id: 'production', label: 'Production' },
    { id: 'boston', label: 'Boston' },
    { id: 'scanningTechs', label: 'Scanning Techs' },
    { id: 'cadcam', label: 'CAD/CAM' },
    { id: 'qms', label: 'QMS' },
  ];

  ihTaskGroups = [
    { id: 'cs', label: 'CS' },
    { id: 'sales', label: 'Sales' },
    { id: 'tp', label: 'TP' },
    { id: 'ops', label: 'Ops' },
    { id: 'finance', label: 'Finance' },
    { id: 'guidesAssembly', label: 'Guides Assembly' },
    { id: 'restorationsEG', label: 'Restorations EG' },
    { id: 'production', label: 'Production' },
    { id: 'boston', label: 'Boston' },
    { id: 'scanningTechs', label: 'Scanning Techs' },
    { id: 'cadcam', label: 'CAD/CAM' },
  ];

  convCustomOptions = [
    { value: 'none', label: 'None' },
    { value: 'fullBasic', label: 'Full Basic' },
    { value: 'fullCustom', label: 'Full Custom' },
    { value: 'qlBasic', label: 'Q-L-Basic' },
    { value: 'qrBasic', label: 'Q-R-Basic' },
    { value: 'qlCustom', label: 'Q-L-Custom' },
    { value: 'qrCustom', label: 'Q-R-Custom' },
    { value: 'anteriorBasic', label: 'Anterior-Basic' },
    { value: 'anteriorCustom', label: 'Anterior-Custom' },
  ];

  convStatusOptions = [
    { value: 'noScans', label: 'No Scans' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'onHold', label: 'On Hold' },
    { value: 'waitingModelScan', label: 'Waiting Model Scan' },
  ];

  sgTypeOfGuideOptions = [
    { value: 'pilot', label: 'Pilot' },
    { value: 'lsd', label: 'LSD' },
    { value: 'classic', label: 'Classic' },
    { value: 'simplantSafe', label: 'Simplant Safe' },
    { value: 'compatability', label: 'Compatability' },
  ];

  sgStatusOptions = [
    { value: 'reviewingOrder', label: 'Reviewing Order' },
    { value: 'waitingConfirmation', label: 'Waiting Confirmation' },
    { value: 'sleeveDesign', label: 'Sleeve Design' },
    { value: 'tpQc', label: 'TP-QC' },
    { value: 'guideDesign', label: 'Guide Design' },
    { value: 'guidePrinting', label: 'Guide Printing' },
    { value: 'awaitingModifications', label: 'Awaiting Guide Design Modifications' },
    { value: 'modificationsDone', label: 'Guide Design Modifications Done' },
    { value: 'onHold', label: 'On Hold' },
    { value: 'shipped', label: 'Shipped' },
  ];

  sgShipAddressOptions = [
    { value: 'default', label: 'Default' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'other', label: 'Other' },
  ];

  sgZeroCostReasons = [
    { value: '', label: 'Select Zero Cost Reason' },
    { value: 'redo', label: 'Redo' },
    { value: 'warranty', label: 'Warranty' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'other', label: 'Other' },
  ];

  finalRestZeroCostReasons = [
    { value: '', label: 'Select Zero Cost Reason' },
    { value: 'redo', label: 'Redo' },
    { value: 'warranty', label: 'Warranty' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'other', label: 'Other' },
  ];

  reportStatusOptions = [
    { value: 'noScans', label: 'No Scans' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'onHold', label: 'On Hold' },
  ];

  miscOrderTypes = [
    { value: '3ddxStraightKit', label: '3DDX Straight Kit' },
    { value: '3ddxTaperedKit', label: '3DDX Tapered Kit' },
    { value: 'sleeves', label: 'Sleeves' },
    { value: 'drills', label: 'Drills' },
    { value: 'prostheticComponent', label: 'Prosthetic Component' },
    { value: 'shippingLabel', label: 'Shipping Label' },
    { value: 'sureMarkers', label: 'Sure Markers' },
    { value: '3dPrinter', label: '3D Printer' },
    { value: 'eliteScanner', label: 'Elite Scanner' },
    { value: 'other', label: 'Other' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeToothChart();
    this.initializeForm();
  }

  initializeToothChart(): void {
    // Upper arch: teeth 1-16 (left to right)
    this.upperTeeth = Array.from({ length: 16 }, (_, i) => ({
      number: i + 1,
      missing: false,
      implant: false,
    }));

    // Lower arch: teeth 17-32 (right to left, mirrored)
    this.lowerTeeth = Array.from({ length: 16 }, (_, i) => ({
      number: 32 - i,
      missing: false,
      implant: false,
    }));
  }

  initializeForm(): void {
    this.form = this.fb.group({
      // Section 1: Case Info
      scanningCenter: ['', Validators.required],
      doctor: ['', Validators.required],
      clientToBeBilled: ['doctor', Validators.required],
      patientName: ['', Validators.required],

      // Section 2: Select Orders
      modelRegistration: [false],
      conversion: [false],
      treatmentPlan: [false],
      surgicalGuide: [false],
      tempRestorations: [false],
      finalRestorations: [false],
      report: [false],
      otherServices: [false],
      misc: [false],

      // Section 3: Notes
      internalCaseNote: [''],
      specialPreShippingInstruction: [''],
      clientCaseNote: [''],

      // Section 4: File Attachment
      attachedFile: [null],

      // Section 5: Notifications
      sendMailTo: [[]],
      sendIHTask: [''],
      rushTask: [false],

      // Section 6: Software & Order Settings
      software: ['simplant', Validators.required],
      separateOrders: ['no', Validators.required],

      // Section 7: Tooth Chart (will be populated dynamically)
      teeth: [[]],

      // Treatment Plan Section (conditional)
      treatmentPlanMaxilla: ['none'],
      treatmentPlanMandible: ['none'],
      treatmentPlanReview: ['no'],
      treatmentPlanReviewType: ['none'],
      treatmentPlanRush: [false],
      treatmentPlanRedo: [false],
      treatmentPlanPortableVersion: [false],
      treatmentPlanStatus: ['noScans'],
      treatmentPlanImplantType: [''],
      treatmentPlanProsthesisType: [''],
      treatmentPlanSurgicalProcedures: [''],
      treatmentPlanAmount: [0],

      // Model Registration Section (conditional)
      modelRegHasIntraoralScan: ['no'],
      modelRegImpressionScans: ['no'],
      modelRegRedo: ['no'],
      modelRegAmount: [0],

      // Conversion Section (conditional)
      conversionSendThrough: ['caseXchange'],
      conversionCustomizationMaxilla: ['none'],
      conversionCustomizationMandible: ['none'],
      conversionRush: ['no'],
      conversionRedo: ['no'],
      conversionPortableVersion: ['no'],
      conversionStatus: ['noScans'],
      conversionStatusReason: [''],
      conversionAmount: [0],

      // Surgical Guide Section (conditional)
      sgIsRealGuide: ['no'],
      sgCameAcrossCaseXchange: ['no'],
      sgRushIfPossible: ['no'],
      sgRedo: ['no'],
      sgGuideSupport: ['teeth'],
      sgTypeOfGuide: ['pilot'],
      sgTypeOfGuideCompatability: [''],
      sgMagnet: [''],
      sgPilotDrillDiameter: [''],
      sgExtraComponents: [''],
      sgFixationFunctionality: ['no'],
      sgOrderId: [''],
      sgVoucher: [''],
      sgDateOfSurgery: [''],
      sgShipToAddress: ['default'],
      sgEstimatedDelivery: [''],
      sgStatusOfGuide: ['reviewingOrder'],
      sgStatusOfGuideReason: [''],
      sgDigitalGuideOnly: ['no'],
      sgPrice: [0],
      sgBiteplate: [0],
      sgShippingAndHandling: [35],
      sgGuide: [0],
      sgLab: [0],
      sgFixationFunctionalityCost: [0],
      sgExtraComponentsCost: [0],
      sgRushFees: [0],
      sgAmount: [0],
      sgZeroCostReason: [''],

      // Temp Restorations Section (conditional)
      tempRestTypeTemp: [false],
      tempRestTypeGfmrBridge: [false],
      tempRestTypeFmpGfmp: [false],
      tempRestAmount: [0],

      // Final Restorations Section (conditional)
      finalRestRush: ['no'],
      finalRestPouring: ['no'],
      finalRestServiceCrown: [false],
      finalRestServiceCrownBridge: [false],
      finalRestServiceAestheticPmma: [false],
      finalRestServiceFullArchWithTemp: [false],
      finalRestServiceFullArchFinal: [false],
      finalRestServiceCustomAbutment: [false],
      finalRestRushFees: [0],
      finalRestImpressionPouring: [0],
      finalRestShippingHandling: [0],
      finalRestAmount: [0],
      finalRestZeroCostReason: [''],

      // Report Section (conditional)
      reportDob: [''],
      reportGender: ['female'],
      reportRelevantHistory: [''],
      reportImplantPlanned: ['no'],
      reportEvaluateExistingImplant: ['no'],
      reportSinusEvaluation: ['no'],
      reportTmjEvaluation: ['no'],
      reportRuleOutPathology: ['yes'],
      reportAirwayEvaluation: ['no'],
      reportBasicReport: ['no'],
      reportSmallFieldOfView: ['no'],
      reportDateOfImageAcquisition: [''],
      reportStatus: ['noScans'],
      reportStatusReason: [''],
      reportRush: ['no'],
      reportRedo: ['no'],
      reportClientNotes: [''],
      reportRadiologistNotes: [''],
      reportAmount: [80],

      // Misc Section (conditional)
      miscOrderType: [''],
      miscComment: [''],
      miscAmount: [0],
    });

    // Watch for order type changes
    this.form.get('surgicalGuide')?.valueChanges.subscribe((checked) => {
      this.showSurgicalGuidePanel = checked;
    });

    this.form.get('tempRestorations')?.valueChanges.subscribe((checked) => {
      this.showTempRestorationsPanel = checked;
    });

    this.form.get('finalRestorations')?.valueChanges.subscribe((checked) => {
      this.showFinalRestorationsPanel = checked;
    });

    this.form.get('treatmentPlan')?.valueChanges.subscribe((checked) => {
      this.showTreatmentPlanPanel = checked;
      if (checked) {
        this.calculateTreatmentPlanCost();
      }
    });

    this.form.get('modelRegistration')?.valueChanges.subscribe((checked) => {
      this.showModelRegistrationPanel = checked;
    });

    this.form.get('conversion')?.valueChanges.subscribe((checked) => {
      this.showConversionPanel = checked;
    });

    this.form.get('report')?.valueChanges.subscribe((checked) => {
      this.showReportPanel = checked;
    });

    this.form.get('misc')?.valueChanges.subscribe((checked) => {
      this.showMiscPanel = checked;
    });

    this.form.get('rushTask')?.valueChanges.subscribe((checked) => {
      this.isRush = checked;
    });
  }

  toggleMailTo(groupId: string): void {
    const current = this.form.get('sendMailTo')?.value || [];
    const index = current.indexOf(groupId);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(groupId);
    }
    
    this.form.patchValue({ sendMailTo: current });
  }

  isMailToChecked(groupId: string): boolean {
    const current = this.form.get('sendMailTo')?.value || [];
    return current.includes(groupId);
  }

  toggleTooth(tooth: ToothState, property: 'missing' | 'implant'): void {
    tooth[property] = !tooth[property];
    this.updateTeethFormValue();
  }

  updateTeethFormValue(): void {
    const allTeeth = [...this.upperTeeth, ...this.lowerTeeth];
    this.form.patchValue({ teeth: allTeeth });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.form.patchValue({ attachedFile: files[0] });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.form.patchValue({ attachedFile: input.files[0] });
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.form.patchValue({ attachedFile: null });
  }

  get grandTotal(): number {
    const fields = [
      'modelRegAmount',
      'conversionAmount',
      'treatmentPlanAmount',
      'sgAmount',
      'tempRestAmount',
      'finalRestAmount',
      'reportAmount',
      'miscAmount',
    ];
    return fields.reduce((sum, f) => sum + (Number(this.form.get(f)?.value) || 0), 0);
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });

    // Validate at least one order type is selected
    const orderTypes = [
      'modelRegistration',
      'conversion',
      'treatmentPlan',
      'surgicalGuide',
      'tempRestorations',
      'finalRestorations',
      'report',
      'otherServices',
      'misc',
    ];

    const hasOrderType = orderTypes.some((type) => this.form.get(type)?.value);

    if (!hasOrderType) {
      this.showModal('warning', 'No Order Selected', 'Please select at least one order type before saving.');
      return;
    }

    if (this.form.valid) {
      // Map form data to Order model
      const newOrder = this.mapFormToOrder();
      
      // Save to localStorage via OrderService
      this.orderService.saveOrder(newOrder);
      
      console.log('Order saved:', newOrder);
      this.showModal('success', 'Order Saved', 'The order has been saved successfully.');
    } else {
      console.log('Form is invalid:', this.form.errors);
      this.showModal('error', 'Validation Error', 'Please fill in all required fields before saving.');
    }
  }

  /**
   * Map form data to Order model
   */
  private mapFormToOrder(): Order {
    const formValue = this.form.value;
    const now = new Date().toISOString();
    const orderId = this.orderService.generateOrderId();
    const currentUsername = this.authService.getUsername();
    
    // Determine primary order type
    const orderType = this.getPrimaryOrderType();
    const orderLabel = this.getOrderLabel();
    
    // Calculate total amount
    const totalAmount = this.grandTotal;
    
    // Create the order object
    const order: Order = {
      // Core fields
      id: orderId,
      orderSource: 'CP',
      scanCenter: formValue.scanningCenter || '',
      doctor: formValue.doctor || '',
      patientName: formValue.patientName || '',
      patientNumbering: 'FDI Numbering',
      isVip: false,
      isLocked: false,
      notes: formValue.internalCaseNote || '',
      archiveDate: '',
      orderType: orderType,
      orderLabel: orderLabel,
      
      // Patient/Clinical data
      maxillary: this.hasMaxillaryWork() ? 'Upper' : null,
      mandibular: this.hasMandibularWork() ? 'Lower' : null,
      format: 'STL',
      
      // Order status tracking
      orderStatus: 'pending',
      statusHistory: [
        {
          id: 'h1',
          status: 'pending',
          timestamp: now,
          changedBy: currentUsername || 'System',
          reason: 'Order created',
          reasonCode: 'ORDER_CREATED',
          notes: 'Created via CP'
        }
      ],
      currentStatusReason: 'Order created',
      statusChangeNotes: '',
      statusLastChangedAt: now,
      estimatedCompletionDate: this.calculateEstimatedCompletion(),
      actualCompletionDate: '',
      
      // Legacy fields
      billTo: formValue.clientToBeBilled === 'doctor' ? formValue.doctor : formValue.patientName,
      billToAccount: 'Pending',
      amountBilled: totalAmount,
      vouchers: '',
      receivedTime: now,
      sentTime: '',
      updateTime: '',
      updateStatus: 'No Updates',
      chargedOn: '',
      action: 'Processing',
      changeRequest: '',
      csTask: null,
      
      // Financial complexity
      financials: {
        basePrice: totalAmount,
        discountAmount: 0,
        discountPercentage: 0,
        discountCode: '',
        subtotal: totalAmount,
        taxRate: 0.14,
        taxAmount: totalAmount * 0.14,
        shippingCost: 8,
        handlingFee: 0,
        insuranceFee: 0,
        totalAmount: (totalAmount * 1.14) + 8,
        currency: 'USD',
        exchangeRate: 1.0,
        originalCurrency: 'USD',
        originalAmount: (totalAmount * 1.14) + 8,
        lineItems: this.buildLineItems(),
        deposits: [],
        outstandingBalance: (totalAmount * 1.14) + 8,
        daysOverdue: 0
      },
      paymentStatus: 'pending',
      paymentMethod: 'credit_card',
      invoiceId: `INV-${orderId}`,
      invoiceGeneratedAt: now,
      billingAddress: {
        street: '123 Medical Center Dr',
        city: 'Cairo',
        state: 'Cairo',
        zipCode: '11511',
        country: 'Egypt'
      },
      refundDetails: null,
      
      // Shipping intelligence
      shipping: {
        shippingMethod: 'standard',
        carrier: 'FedEx Egypt',
        trackingNumber: `FDX${orderId}`,
        estimatedDeliveryDate: this.calculateEstimatedCompletion(),
        actualDeliveryDate: '',
        deliveryStatus: 'pending',
        shippingAddress: {
          recipientName: formValue.patientName,
          street: '123 Medical Center Dr',
          city: 'Cairo',
          state: 'Cairo',
          zipCode: '11511',
          country: 'Egypt',
          phone: '+20-100-000-0000',
          email: 'contact@clinic.com'
        },
        deliveryNotes: formValue.specialPreShippingInstruction || '',
        requiresSignature: true,
        insured: false,
        insuranceValue: 0,
        shippingCost: 8,
        packageWeight: 0.5,
        packageDimensions: { length: 20, width: 15, height: 10, unit: 'cm' }
      },
      shippingTier: formValue.rushTask ? 'express' : 'standard',
      carrier: 'FedEx Egypt',
      trackingNumber: `FDX${orderId}`,
      deliveryTimeEstimate: formValue.rushTask ? '1-2 business days' : '3-5 business days',
      actualDeliveryDate: '',
      deliverySignature: true,
      multipleShippingAddresses: [],
      shippingAddressValidationStatus: 'valid',
      shippingAddressNotes: '',
      
      // Analytics
      analytics: {
        customerLifetimeValue: totalAmount * 5,
        orderFrequency: 1,
        productAffinityScores: { [orderType]: 1.0 },
        deliverySatisfactionScore: 0,
        qualitySatisfactionScore: 0,
        isRepeatingCustomer: false,
        customerSince: now,
        averageOrderValue: totalAmount
      },
      
      // Customer profile
      customerProfile: {
        customerId: `CUST-${orderId}`,
        customerType: 'clinic',
        segmentationTags: ['new'],
        preferredContact: 'email',
        communicationPreferences: {
          newsletter: true,
          promotional: false,
          orderUpdates: true,
          surveyRequests: false
        },
        loyaltyProgramStatus: 'bronze',
        pointsBalance: 0,
        memberSince: now,
        lastOrderDate: now,
        totalOrders: 1,
        totalSpent: totalAmount,
        averageOrderValue: totalAmount,
        preferredPaymentMethod: 'credit_card',
        creditLimit: 50000,
        availableCredit: 50000,
        riskProfile: 'low',
        notes: formValue.clientCaseNote || ''
      },
      
      // Sub-services
      subServices: this.buildSubServices()
    };
    
    return order;
  }
  
  /**
   * Build sub-services for each selected order type
   */
  private buildSubServices(): any[] {
    const subServices: any[] = [];
    const formValue = this.form.value;
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + (formValue.rushTask ? 2 : 5));
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    let subServiceId = 1;
    
    // Model Registration sub-services
    if (formValue.modelRegistration && formValue.modelRegAmount > 0) {
      subServices.push({
        id: subServiceId++,
        name: 'Model Registration',
        quantity: 1,
        unitPrice: formValue.modelRegAmount,
        status: 'Pending',
        assignedTo: '—',
        dueDate: dueDateStr,
        completedDate: '',
        notes: formValue.modelRegHasIntraoralScan === 'yes' ? 'Has Intraoral Scan' : ''
      });
    }
    
    // Conversion sub-services
    if (formValue.conversion && formValue.conversionAmount > 0) {
      subServices.push({
        id: subServiceId++,
        name: 'Conversion',
        quantity: 1,
        unitPrice: formValue.conversionAmount,
        status: this.getConversionStatus(formValue.conversionStatus),
        assignedTo: '—',
        dueDate: dueDateStr,
        completedDate: '',
        notes: `${formValue.conversionCustomizationMaxilla !== 'none' ? 'Maxilla: ' + formValue.conversionCustomizationMaxilla : ''} ${formValue.conversionCustomizationMandible !== 'none' ? 'Mandible: ' + formValue.conversionCustomizationMandible : ''}`.trim()
      });
    }
    
    // Treatment Plan sub-services
    if (formValue.treatmentPlan && formValue.treatmentPlanAmount > 0) {
      subServices.push({
        id: subServiceId++,
        name: 'Treatment Plan',
        quantity: 1,
        unitPrice: formValue.treatmentPlanAmount,
        status: this.getTreatmentPlanStatus(formValue.treatmentPlanStatus),
        assignedTo: '—',
        dueDate: dueDateStr,
        completedDate: '',
        notes: `${formValue.treatmentPlanMaxilla !== 'none' ? 'Maxilla: ' + formValue.treatmentPlanMaxilla : ''} ${formValue.treatmentPlanMandible !== 'none' ? 'Mandible: ' + formValue.treatmentPlanMandible : ''}`.trim()
      });
    }
    
    // Surgical Guide sub-services
    if (formValue.surgicalGuide && formValue.sgAmount > 0) {
      // Guide Design
      subServices.push({
        id: subServiceId++,
        name: 'Surgical Guide Design',
        quantity: 1,
        unitPrice: formValue.sgGuide || 0,
        status: this.getSurgicalGuideStatus(formValue.sgStatusOfGuide),
        assignedTo: '—',
        dueDate: dueDateStr,
        completedDate: '',
        notes: `Type: ${formValue.sgTypeOfGuide}, Support: ${formValue.sgGuideSupport}`
      });
      
      // Guide Printing (if physical guide)
      if (formValue.sgDigitalGuideOnly !== 'yes') {
        subServices.push({
          id: subServiceId++,
          name: 'Surgical Guide Printing',
          quantity: 1,
          unitPrice: formValue.sgPrice || 0,
          status: 'Pending',
          assignedTo: '—',
          dueDate: dueDateStr,
          completedDate: '',
          notes: formValue.sgRushIfPossible === 'yes' ? 'Rush if possible' : ''
        });
      }
      
      // Lab work if applicable
      if (formValue.sgLab > 0) {
        subServices.push({
          id: subServiceId++,
          name: 'Surgical Guide Lab Work',
          quantity: 1,
          unitPrice: formValue.sgLab,
          status: 'Pending',
          assignedTo: '—',
          dueDate: dueDateStr,
          completedDate: '',
          notes: ''
        });
      }
    }
    
    // Temp Restorations sub-services
    if (formValue.tempRestorations && formValue.tempRestAmount > 0) {
      const tempTypes: string[] = [];
      if (formValue.tempRestTypeTemp) tempTypes.push('Temp');
      if (formValue.tempRestTypeGfmrBridge) tempTypes.push('GFMR-Bridge');
      if (formValue.tempRestTypeFmpGfmp) tempTypes.push('FMP-GFMP');
      
      subServices.push({
        id: subServiceId++,
        name: 'Temp Restoration',
        quantity: 1,
        unitPrice: formValue.tempRestAmount,
        status: 'Pending',
        assignedTo: '—',
        dueDate: dueDateStr,
        completedDate: '',
        notes: tempTypes.length > 0 ? `Types: ${tempTypes.join(', ')}` : ''
      });
    }
    
    // Final Restorations sub-services
    if (formValue.finalRestorations && formValue.finalRestAmount > 0) {
      const services: string[] = [];
      if (formValue.finalRestServiceCrown) services.push('Crown');
      if (formValue.finalRestServiceCrownBridge) services.push('Crown & Bridge');
      if (formValue.finalRestServiceAestheticPmma) services.push('Aesthetic PMMA');
      if (formValue.finalRestServiceFullArchWithTemp) services.push('Full Arch with Temp');
      if (formValue.finalRestServiceFullArchFinal) services.push('Full Arch Final');
      if (formValue.finalRestServiceCustomAbutment) services.push('Custom Abutment');
      
      // Design phase
      subServices.push({
        id: subServiceId++,
        name: 'Final Restoration Design',
        quantity: 1,
        unitPrice: formValue.finalRestAmount * 0.4, // 40% for design
        status: 'Pending',
        assignedTo: '—',
        dueDate: dueDateStr,
        completedDate: '',
        notes: services.length > 0 ? `Services: ${services.join(', ')}` : ''
      });
      
      // Manufacturing phase
      subServices.push({
        id: subServiceId++,
        name: 'Final Restoration Manufacturing',
        quantity: 1,
        unitPrice: formValue.finalRestAmount * 0.4, // 40% for manufacturing
        status: 'Pending',
        assignedTo: '—',
        dueDate: dueDateStr,
        completedDate: '',
        notes: formValue.finalRestRush === 'yes' ? 'Rush order' : ''
      });
      
      // QC phase
      subServices.push({
        id: subServiceId++,
        name: 'Final Restoration QC',
        quantity: 1,
        unitPrice: formValue.finalRestAmount * 0.2, // 20% for QC
        status: 'Pending',
        assignedTo: '—',
        dueDate: dueDateStr,
        completedDate: '',
        notes: ''
      });
    }
    
    // Report sub-services
    if (formValue.report && formValue.reportAmount > 0) {
      const evaluations: string[] = [];
      if (formValue.reportImplantPlanned === 'yes') evaluations.push('Implant Planning');
      if (formValue.reportEvaluateExistingImplant === 'yes') evaluations.push('Existing Implant');
      if (formValue.reportSinusEvaluation === 'yes') evaluations.push('Sinus');
      if (formValue.reportTmjEvaluation === 'yes') evaluations.push('TMJ');
      if (formValue.reportRuleOutPathology === 'yes') evaluations.push('Pathology');
      if (formValue.reportAirwayEvaluation === 'yes') evaluations.push('Airway');
      
      subServices.push({
        id: subServiceId++,
        name: 'Radiological Report',
        quantity: 1,
        unitPrice: formValue.reportAmount,
        status: this.getReportStatus(formValue.reportStatus),
        assignedTo: '—',
        dueDate: dueDateStr,
        completedDate: '',
        notes: evaluations.length > 0 ? `Evaluations: ${evaluations.join(', ')}` : ''
      });
    }
    
    // Misc sub-services
    if (formValue.misc && formValue.miscAmount > 0) {
      const miscType = this.miscOrderTypes.find(t => t.value === formValue.miscOrderType);
      subServices.push({
        id: subServiceId++,
        name: miscType?.label || 'Miscellaneous',
        quantity: 1,
        unitPrice: formValue.miscAmount,
        status: 'Pending',
        assignedTo: '—',
        dueDate: dueDateStr,
        completedDate: '',
        notes: formValue.miscComment || ''
      });
    }
    
    return subServices;
  }
  
  /**
   * Convert conversion status to display status
   */
  private getConversionStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'noScans': 'Pending',
      'inProgress': 'In Progress',
      'done': 'Completed',
      'onHold': 'Pending',
      'waitingModelScan': 'Pending'
    };
    return statusMap[status] || 'Pending';
  }
  
  /**
   * Convert treatment plan status to display status
   */
  private getTreatmentPlanStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'noScans': 'Pending',
      'inProgress': 'In Progress',
      'done': 'Completed',
      'onHold': 'Pending'
    };
    return statusMap[status] || 'Pending';
  }
  
  /**
   * Convert surgical guide status to display status
   */
  private getSurgicalGuideStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'reviewingOrder': 'Pending',
      'waitingConfirmation': 'Pending',
      'sleeveDesign': 'In Progress',
      'tpQc': 'In Progress',
      'guideDesign': 'In Progress',
      'guidePrinting': 'In Progress',
      'awaitingModifications': 'Pending',
      'modificationsDone': 'In Progress',
      'onHold': 'Pending',
      'shipped': 'Completed'
    };
    return statusMap[status] || 'Pending';
  }
  
  /**
   * Convert report status to display status
   */
  private getReportStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'noScans': 'Pending',
      'inProgress': 'In Progress',
      'done': 'Completed',
      'onHold': 'Pending'
    };
    return statusMap[status] || 'Pending';
  }
  
  /**
   * Get primary order type from selected checkboxes
   */
  private getPrimaryOrderType(): string {
    const formValue = this.form.value;
    
    if (formValue.surgicalGuide) return 'Surgical Guide';
    if (formValue.treatmentPlan) return 'Treatment Plan';
    if (formValue.finalRestorations) return 'Final Restoration';
    if (formValue.tempRestorations) return 'Temp Restoration';
    if (formValue.modelRegistration) return 'Model Registration';
    if (formValue.conversion) return 'Conversion';
    if (formValue.report) return 'Report';
    if (formValue.misc) return 'Misc';
    if (formValue.otherServices) return 'Other Services';
    
    return 'General Order';
  }
  
  /**
   * Get order label based on rush status
   */
  private getOrderLabel(): string {
    return this.form.value.rushTask ? 'Rush' : 'Standard';
  }
  
  /**
   * Check if order involves maxillary work
   */
  private hasMaxillaryWork(): boolean {
    const formValue = this.form.value;
    return formValue.treatmentPlanMaxilla !== 'none' || 
           formValue.conversionCustomizationMaxilla !== 'none' ||
           this.upperTeeth.some(t => t.implant || t.missing);
  }
  
  /**
   * Check if order involves mandibular work
   */
  private hasMandibularWork(): boolean {
    const formValue = this.form.value;
    return formValue.treatmentPlanMandible !== 'none' || 
           formValue.conversionCustomizationMandible !== 'none' ||
           this.lowerTeeth.some(t => t.implant || t.missing);
  }
  
  /**
   * Calculate estimated completion date (5 business days from now, or 2 for rush)
   */
  private calculateEstimatedCompletion(): string {
    const daysToAdd = this.form.value.rushTask ? 2 : 5;
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Build line items for financial breakdown
   */
  private buildLineItems(): any[] {
    const items: any[] = [];
    const formValue = this.form.value;
    
    if (formValue.modelRegistration && formValue.modelRegAmount > 0) {
      items.push({
        id: `item-${items.length + 1}`,
        description: 'Model Registration',
        quantity: 1,
        unitPrice: formValue.modelRegAmount,
        totalPrice: formValue.modelRegAmount,
        category: 'service'
      });
    }
    
    if (formValue.conversion && formValue.conversionAmount > 0) {
      items.push({
        id: `item-${items.length + 1}`,
        description: 'Conversion',
        quantity: 1,
        unitPrice: formValue.conversionAmount,
        totalPrice: formValue.conversionAmount,
        category: 'service'
      });
    }
    
    if (formValue.treatmentPlan && formValue.treatmentPlanAmount > 0) {
      items.push({
        id: `item-${items.length + 1}`,
        description: 'Treatment Plan',
        quantity: 1,
        unitPrice: formValue.treatmentPlanAmount,
        totalPrice: formValue.treatmentPlanAmount,
        category: 'service'
      });
    }
    
    if (formValue.surgicalGuide && formValue.sgAmount > 0) {
      items.push({
        id: `item-${items.length + 1}`,
        description: 'Surgical Guide',
        quantity: 1,
        unitPrice: formValue.sgAmount,
        totalPrice: formValue.sgAmount,
        category: 'service'
      });
    }
    
    if (formValue.tempRestorations && formValue.tempRestAmount > 0) {
      items.push({
        id: `item-${items.length + 1}`,
        description: 'Temp Restorations',
        quantity: 1,
        unitPrice: formValue.tempRestAmount,
        totalPrice: formValue.tempRestAmount,
        category: 'service'
      });
    }
    
    if (formValue.finalRestorations && formValue.finalRestAmount > 0) {
      items.push({
        id: `item-${items.length + 1}`,
        description: 'Final Restorations',
        quantity: 1,
        unitPrice: formValue.finalRestAmount,
        totalPrice: formValue.finalRestAmount,
        category: 'service'
      });
    }
    
    if (formValue.report && formValue.reportAmount > 0) {
      items.push({
        id: `item-${items.length + 1}`,
        description: 'Report',
        quantity: 1,
        unitPrice: formValue.reportAmount,
        totalPrice: formValue.reportAmount,
        category: 'service'
      });
    }
    
    if (formValue.misc && formValue.miscAmount > 0) {
      items.push({
        id: `item-${items.length + 1}`,
        description: `Misc - ${formValue.miscOrderType || 'Other'}`,
        quantity: 1,
        unitPrice: formValue.miscAmount,
        totalPrice: formValue.miscAmount,
        category: 'service'
      });
    }
    
    return items;
  }

  onCancel(): void {
    this.showModal('confirm', 'Discard Changes', 'Are you sure you want to cancel? All unsaved changes will be lost.');
  }

  // ── Modal state ──────────────────────────────────────────────
  modal: {
    visible: boolean;
    type: 'confirm' | 'success' | 'error' | 'warning';
    title: string;
    message: string;
  } = { visible: false, type: 'confirm', title: '', message: '' };

  showModal(type: 'confirm' | 'success' | 'error' | 'warning', title: string, message: string): void {
    this.modal = { visible: true, type, title, message };
  }

  closeModal(): void {
    this.modal = { ...this.modal, visible: false };
  }

  confirmModal(): void {
    this.closeModal();
    if (this.modal.type === 'confirm') {
      this.router.navigate(['/orders']);
    } else if (this.modal.type === 'success') {
      this.router.navigate(['/orders']);
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('required') && control.touched) {
      return 'This field is required';
    }
    return '';
  }

  calculateTreatmentPlanCost(): void {
    let totalCost = 0;
    const baseCost = 150; // Base treatment plan cost

    // Plan type costs
    const maxillaPlan = this.form.get('treatmentPlanMaxilla')?.value;
    const mandiblePlan = this.form.get('treatmentPlanMandible')?.value;

    if (maxillaPlan === 'fullArch') {
      totalCost += 200;
    } else if (maxillaPlan === 'quadrant') {
      totalCost += 100;
    }

    if (mandiblePlan === 'fullArch') {
      totalCost += 200;
    } else if (mandiblePlan === 'quadrant') {
      totalCost += 100;
    }

    // Review costs
    const reviewType = this.form.get('treatmentPlanReviewType')?.value;
    if (reviewType === 'replication') {
      totalCost += 50;
    } else if (reviewType === 'consultation') {
      totalCost += 75;
    } else if (reviewType === 'regular') {
      totalCost += 100;
    }

    // Rush fee
    if (this.form.get('treatmentPlanRush')?.value) {
      totalCost += 150;
    }

    // Portable version fee
    if (this.form.get('treatmentPlanPortableVersion')?.value) {
      totalCost += 50;
    }

    // Add base cost if any plan is selected
    if (maxillaPlan !== 'none' || mandiblePlan !== 'none') {
      totalCost += baseCost;
    }

    this.form.patchValue({ treatmentPlanAmount: totalCost }, { emitEvent: false });
  }

  onTreatmentPlanChange(): void {
    this.calculateTreatmentPlanCost();
  }
}
