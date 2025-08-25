


export type AppView = 'dashboard' | 'project' | 'settings' | 'crm';
export type AppTool = 'dashboard' | 'estimator' | 'scheduleOfValues' | 'changeOrder' | 'dailyLog' | 'rfiManager' | 'invoicing' | 'email' | 'drive' | 'inspections' | 'projectContacts' | 'riskManagement' | 'clientPortal' | 'photoGallery' | 'testingAndQuality' | 'expenseTracker' | 'reporting' | 'submittals' | 'incidents' | 'timeTracking';

// =================================================================
// == Core Data Structures
// =================================================================

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  logo: string; // base64 encoded string
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  billableRate?: number; // Hourly rate for time tracking
}

export interface Project {
  id: string;
  // Intake data
  name: string;
  address: string;
  clientName: string;
  
  // App state
  activeTool: AppTool;
  
  // Project-specific contact IDs
  contactIds: string[];

  // Feature Flags
  usesScheduleOfValues: boolean;

  // Tool-specific data stores
  estimator: {
    apiResponse: GeminiResponse | null;
    stagedRfis: RfiItem[];
    processedPlanText: string;
  };
  rfiManager: {
    managedRfis: ManagedRfiItem[];
  };
  inspections: InspectionRequest[];
  dailyLogs: DailyLog[];
  email: Email[];
  drive: DriveFile[];
  invoicing: InvoiceState;
  riskManagement: {
    risks: RiskItem[];
    meetings: Meeting[];
  };
  clientUpdates: ClientUpdate[];
  testingAndQuality: TestInstance[];
  expenses: Expense[];
  submittals: Submittal[];
  incidents: Incident[];
  customReports: CustomReport[];
  timeEntries: TimeEntry[];
}


// =================================================================
// == Tool-Specific Types
// =================================================================

export interface ChangeOrderFormState {
  scopeChange: string;
  costImpact: string;
  scheduleImpact: string;
}

export interface DailyLogFormState {
  notes: string;
  photo?: File;
}

export type DailyLogStatus = 'Draft' | 'Signed';

export interface DailyLog {
  id: string;
  date: string;
  notes: string;
  photoUrl?: string; // a path/id to a file in the drive
  status: DailyLogStatus;
  driveFileId?: string;
  signedBy?: string;
  signedAt?: string;
  revisionOf?: string; // ID of the log this is a revision of
}

export enum Mode {
  All = 'all',
  EstimateOnly = 'estimate_only',
  ProposalOnly = 'proposal_only',
  ReplyOnly = 'reply_only',
}

export enum Unit {
  Each = 'EA',
  LinearFoot = 'LF',
  SquareFoot = 'SF',
  SquareYard = 'SY',
  CubicYard = 'CY',
  Hour = 'HR',
  LumpSum = 'LS',
}

export enum Confidence {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export interface LineItem {
  item: string;
  unit: Unit;
  qty: number;
  confidence: Confidence;
  notes: string;
  unitPrice?: number;
  lineTotal?: number;
}

export interface EstimateJSON {
  project_id: string;
  scope_summary: string;
  assumptions: string[];
  line_items: LineItem[];
  exclusions: string[];
}

export interface RfiItem {
  subject: string;
  question:string;
}

export type RfiStatus = 'Draft' | 'Sent' | 'Answered' | 'Closed';

export interface RfiLogEntry {
  timestamp: string;
  note: string;
}

export interface ManagedRfiItem extends RfiItem {
  id: string;
  status: RfiStatus;
  answer?: string;
  analysis?: string;
  log?: RfiLogEntry[];
}

// Types for Inspection Management
export type InspectionStatus = 'Open' | 'Scheduled' | 'Passed' | 'Failed' | 'Closed';

export interface AuditLogEntry {
    timestamp: string;
    user: string; // For simplicity, we'll use a string like "Project Manager"
    action: string;
}

export interface InspectionRequest {
  id: string;
  inspectionNumber: number;
  type: string;
  recipientName: string;
  recipientEmail: string;
  requestedDate: string;
  scheduledDate?: string;
  status: InspectionStatus;
  outcomeNotes?: string;
  relatedInspectionId?: string; // Links a follow-up to a failed one
  isSigned: boolean;
  signedBy?: string;
  signedAt?: string;
  driveFileId?: string;
  auditLog: AuditLogEntry[];
}


export interface GeminiResponse {
  estimate_json: EstimateJSON;
  proposal_text: string;
  bid_reply_email: string;
  rfi_list: RfiItem[];
}

export interface FormState {
  mode: Mode;
  projectId: string;
  projectName: string;
  trade: string;
  jurisdiction: string;
  planText: string;
  gcQuestions: string;
  knownConstraints: string;
}

// Types for Invoicing Feature
export interface ContractLineItem {
  id: string;
  itemNumber: string;
  description: string;
  scheduledValue: number;
  prevBilled: number;
  thisPeriod: number;
  storedMaterials: number;
  // Link to source data for traceability
  sourceExpenseId?: string;
  sourceTimeEntryIds?: string[];
  // For tracking adjustments/variance
  originalThisPeriodAmount?: number; 
}

export interface ChangeOrderItem {
  id: string;
  description: string;
  value: number;
}

export interface InvoiceState {
  projectName: string;
  applicationNumber: number;
  periodTo: string;
  architectsProjectNumber: string;
  
  lineItems: ContractLineItem[];
  changeOrders: ChangeOrderItem[];
  
  retainagePercentage: number;
  materialsRetainagePercentage: number;
  previousPayments: number;
}

// Types for Communications Features
export interface Email {
    id: string;
    from: string;
    to?: string; // Add a 'to' field for composed emails
    subject: string;
    body: string;
    timestamp: string;
    read: boolean;
}

export interface DriveFile {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string; // Temporary blob URL, not persisted in localStorage
    folderPath: string; // e.g., "/", "/Inspections/", "/Photos/"
    isLocked: boolean; // True if this file is a signed record
    caption?: string;
    annotationMethod?: 'manual' | 'vision' | 'voice';
}

// Types for Risk Management
export type RiskStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Closed';
export type RiskCategory = 'Schedule' | 'Budget' | 'Safety' | 'Quality' | 'Communication' | 'Other';
export type RiskSeverity = 'High' | 'Medium' | 'Low';

export interface RiskItem {
    id: string;
    description: string;
    category: RiskCategory;
    severity: RiskSeverity;
    mitigationPlan: string;
    status: RiskStatus;
    createdAt: string;
    updates: AgendaUpdate[];
}

export type AgendaItemStatus = 'Open' | 'In Progress' | 'Carried Over' | 'Closed';

export interface AgendaUpdate {
    meetingId: string;
    timestamp: string;
    updateText: string;
    status: AgendaItemStatus;
}

export interface Meeting {
    id: string;
    date: string;
    title: string;
    attendees: string[];
}

// Types for Client Portal
export type UpdateStatus = 'Draft' | 'Published';

export interface ClientUpdateSection {
    id: string;
    heading: string;
    content: string;
    imageUrls: string[]; // URLs from Project Drive files
}

export interface ClientUpdate {
    id: string;
    title: string;
    summary: string;
    publicationDate: string;
    status: UpdateStatus;
    sections: ClientUpdateSection[];
}

// Types for Testing & QC
export type TestStatus = 'Pass' | 'Fail' | 'Pending';

export interface TestInstance {
  id: string;
  name: string;
  date: string;
  location: string;
  requiredSpec: string;
  actualResult: string;
  status: TestStatus;
  notes: string;
  sourceDocumentId?: string; // Links to a file in the drive
}

// Types for Expense Tracker
export enum ExpenseCategory {
    Supplies = 'Supplies',
    Fuel = 'Fuel',
    Meals = 'Meals',
    EquipmentRental = 'Equipment Rental',
    Travel = 'Travel',
    Other = 'Other',
}

export interface Expense {
    id: string;
    date: string;
    vendor: string;
    amount: number;
    category: ExpenseCategory;
    description: string;
    invoicable: boolean;
    status: 'Pending' | 'Invoiced';
    sourceReceiptId: string; // Links to a file in the drive
}

// Types for Submittals
export type SubmittalStatus = 'Draft' | 'Open' | 'Pending' | 'Approved' | 'Rejected' | 'Revise & Resubmit' | 'Closed';
export type SubmittalWorkflowRole = 'Approver' | 'Reviewer';

export interface SubmittalWorkflowStep {
  id: string;
  stepNumber: number;
  contactId?: string;
  role: SubmittalWorkflowRole;
  daysToRespond: number;
}

export interface Submittal {
  id: string;
  number: string;
  revision: number;
  title: string;
  status: SubmittalStatus;
  submittalManagerId: string;
  // General Information
  specSection?: string;
  submittalType?: string;
  submittalPackage?: string;
  responsibleContractorId?: string;
  receivedFromId?: string;
  submitByDate?: string;
  receivedDate?: string;
  issueDate?: string;
  // Schedule Information
  requiredOnSiteDate?: string;
  leadTime?: number;
  designTeamReviewTime?: number;
  internalReviewTime?: number;
  // Delivery Information
  confirmedDeliveryDate?: string;
  actualDeliveryDate?: string;
  // Other
  costCode?: string;
  location?: string;
  private: boolean;
  description?: string;
  distributionListIds: string[];
  workflow: SubmittalWorkflowStep[];
  attachments: string[]; // array of driveFileIds
}

// Types for Incident Management
export enum IncidentHazard {
    CaughtInOrBetween = 'Caught In or Between',
    ChemicalExposure = 'Chemical Exposure',
    Electrical = 'Electrical',
    Environmental = 'Environmental',
    Ergonomics = 'Ergonomics',
    ExcavationAndTrenching = 'Excavation and Trenching',
    FallOrSlip = 'Fall or Slip',
    FireOrExplosion = 'Fire or Explosion',
    StruckBy = 'Struck By',
    ToolOrEquipment = 'Tool or Equipment',
    Other = 'Other',
}

export enum IncidentContributingCondition {
    DefectiveToolsOrEquipment = 'Defective Tools or Equipment',
    InadequateGuarding = 'Inadequate Guarding',
    PoorHousekeeping = 'Poor Housekeeping',
    WeatherConditions = 'Weather Conditions',
    WorkplaceViolence = 'Workplace Violence',
    Other = 'Other',
}

export enum IncidentContributingBehavior {
    FailureToFollowProcedure = 'Failure to Follow Procedure',
    ImproperLifting = 'Improper Lifting',
    InadequatePPE = 'Inadequate PPE',
    Inattention = 'Inattention',
    Rushing = 'Rushing',
    Other = 'Other',
}


export interface Incident {
    id: string;
    title: string;
    eventDate: string; // YYYY-MM-DD
    eventTime?: string; // HH:MM
    isTimeUnknown: boolean;
    location: string;
    isRecordable: boolean;
    isPrivate: boolean;
    description: string;
    distributionIds: string[];
    attachments: string[]; // array of driveFileIds
    // Investigation
    hazard?: IncidentHazard;
    contributingCondition?: IncidentContributingCondition;
    contributingBehavior?: IncidentContributingBehavior;
}


// Types for Reporting
export type ReportableDataSource = 'expenses' | 'dailyLogs' | 'rfiManager' | 'inspections';
export type CannedReportId = 'financialSummary' | 'expenseByCategory' | 'rfiLog' | 'billableExpenses';

export interface Filter {
    id: string;
    field: string;
    operator: string;
    value: any;
}

export interface Grouping {
    field: string;
    aggregation: 'sum' | 'count' | 'avg';
    aggField: string;
}

export interface CustomReport {
    id: string;
    name: string;
    dataSource: ReportableDataSource;
    fields: string[];
    filters: Filter[];
    grouping?: Grouping;
}

// Types for Time Tracking
export type TimeEntryStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Invoiced';

export interface TimeEntry {
    id: string;
    employeeId: string; // Links to a Contact
    date: string; // YYYY-MM-DD
    hours: number;
    costCode: string;
    description?: string;
    status: TimeEntryStatus;
    invoiceId?: string; // Links to an invoice when billed
    location?: {
        latitude: number;
        longitude: number;
    };
    locationTimestamp?: string;
}
