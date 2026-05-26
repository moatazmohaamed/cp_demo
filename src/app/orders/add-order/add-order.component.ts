import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';

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
    private router: Router
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
      alert('Please select at least one order type');
      return;
    }

    if (this.form.valid) {
      console.log('Form submitted:', this.form.value);
      // TODO: Add actual submission logic here
      alert('Order saved successfully! (Check console for form data)');
    } else {
      console.log('Form is invalid:', this.form.errors);
      alert('Please fill in all required fields');
    }
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
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
