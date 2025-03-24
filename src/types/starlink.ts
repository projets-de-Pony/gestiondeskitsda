export type Currency = 'XOF' | 'EUR' | 'NGN' | 'RWF';

export type KitStatus = 'active' | 'inactive' | 'suspended' | 'restricted';
export type PaymentStatus = 'paid' | 'pending' | 'late';

export interface Amount {
  amount: number;
  currency: Currency;
}

export interface Contact {
  phones: string[];
  emails: string[];
  whatsapp?: string;
}

export interface HistoryEntry {
  action: string;
  details: string;
  timestamp: Date;
  performedBy: string;
}

// Type de base pour les données communes
interface BaseStarlinkData {
  clientName: string;
  accountName: string;
  originalAmount: Amount;
  billingAmount: Amount;
  amount: number;
  currency: Currency;
  contacts: Contact;
  kitNumber: string;
  kitStatus: KitStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
}

// Type pour le modèle de données avec les dates en tant que Date
export interface StarlinkClient extends BaseStarlinkData {
  id: string;
  activationDate: Date;
  billingDate: Date;
  location: Location;
  maintenanceRecords: MaintenanceRecord[];
  technicalIssues: TechnicalIssue[];
  kitReplacements: KitReplacement[];
  history: HistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Type pour le formulaire avec les dates en tant que string
export interface StarlinkClientFormData extends BaseStarlinkData {
  activationDate: string;
  billingDate: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface StarlinkInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  kitNumber: string;
  originalAmount?: Amount;
  amount: number;
  currency: Currency;
  items: InvoiceItem[];
  status: InvoiceStatus;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export type MaintenanceType = 'preventive' | 'corrective' | 'replacement';
export type MaintenanceStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type TechnicalIssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Location {
  address: string;
  city: string;
  country: string;
  description: string;
}

export interface MaintenanceRecord {
  id: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  technician?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface TechnicalIssue {
  id: string;
  title: string;
  description: string;
  status: TechnicalIssueStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface KitReplacement {
  id: string;
  oldKitNumber: string;
  newKitNumber: string;
  reason: string;
  replacementDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
} 