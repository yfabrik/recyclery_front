interface BaseModel {
  id: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CategoryModel extends BaseModel {
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: number | null;
  subcategories?: CategoryModel[];
  defaultWeight: number;
  defaultPrice: number;
}

export interface StoreModel extends BaseModel {
  employees?: Array<EmployeeModel>;
  manager_id: number;
  manager?: UserModel;
  caisses?: CaisseModel[];
  name: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  postal_code: string;
  is_active: boolean;
  horaires?: ScheduleModel[]
}

export interface CollectionPointModel extends BaseModel {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  type: string;
  notes: string;
  is_active: boolean;
  recyclery_id?: number;
  Recycleries: StoreModel[];
  TaskSchedules?: ScheduleModel[]
}

// export interface PointPresenceModel extends BaseModel {
//   day_of_week: string;
//   time_slot_name: "morning" | "afternoon";
//   is_present: boolean;
//   start_time: string;
//   end_time: string;
//   is_24h: boolean;
//   notes: string;
//   collection_point_id: number;
//   store_id: number;
// }

export interface ArrivalModel extends BaseModel {
  weight: number;
  arrival_date: Date;
  arrival_time: Date;
  source_type: "point" | "apport" | "house_clearance";
  source_details: string;
  notes: string;
  status: string;
}

export interface DonModel extends BaseModel {
  recyclery_id: number;
  received_by: number;
  donor_name: string;
  donor_phone: string;
  donor_email: string;
  item_description: string;
  estimated_value: number;
  status: string;
  received_at: Date;
}

export interface EcoOrgModel extends BaseModel {
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  website: string;
  is_active: boolean;
}

export interface LabeledItemModel extends BaseModel {
  recyclery: number;
  category: number;
  subcategory: number;
  soldBy: number;
  createdBy: number;
  transaction_id: string;

  barcode: string;
  name: string;
  description: string;
  weight: number;
  price: number;
  cost: number;
  condition_state: "excellent" | "good" | "fair" | "poor";
  location: string;
  status: string;
}

export interface UserModel extends BaseModel {
  username: string;
  email: string;
  password?: string;

  phone: string;
  role: string;
  isActive: boolean;
  last_login: Date;
}

export interface TaskModel extends BaseModel {
  name: string;
  description: string | null;
  category: string;
  priority: string | null;
  required_skills: string | null;
  location: string | null;
  equipment_needed: string | null;
  hourly_rate: number | null;
  scheduled_date: Date | string;
  start_time: Date | string;
  end_time: Date | string;
  notes: string | null;
  status: string | null;
  CollectionPointId: number | null;
  RecycleryId: number | null;
  schedule_id: number;
  store_id?: number
  collection_point_id?: number

  day_of_week: string
  // Legacy/computed fields (may be populated by frontend)
  task_employees?: UserModel[];
  assigned_employees?: UserModel[];
  Employees?: EmployeeModel[];
}

export interface EmployeeModel extends BaseModel {
  fullName: string;
  nom: string;
  prenom: string;
  isActive: boolean;
  phone?: string;
  email?: string;
  EmployeeWorkdays?: WorkdaysModel[];
  stores?: StoreModel[];
  EmployeeStore?: {
    is_primary: boolean;
  }[];
}

export interface WorkdaysModel extends BaseModel {
  day_of_week: string;
  time_slot: "morning" | "afternoon";
  is_working: boolean;
  start_time: string;
  end_time: string;
  notes: string;
  employee_id?: number;
}

export interface StoreHoursModel extends BaseModel {
  day_of_week: string;
  name: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
  notes: string;
  is_24h: boolean;
  store_id: number;
}

export interface CaisseModel extends BaseModel {
  name: string;
  is_active: boolean;
  sessions?: CashSession[];
  recyclery_id: number;
  store_name?: string;
  total_sessions?: number;
  last_session?: Date;
  Recyclery?: StoreModel;
}

export interface CashSession extends BaseModel {
  opening_amount: number;
  closing_amount: number;
  expected_amount: number;
  difference_amount: number;
  status: "open" | "close";
  closed_at: Date;
  notes: string;
  cash_register_id: number;
  user_id?: number;

  CashRegister?: CaisseModel;
  User?: UserModel;
}

export interface TransactionModel extends BaseModel {
  change_amount: number;
  total_amount: number;
  payment_method: "cash" | "card" | "check";
  transactionType: "sell" | "refund";
  payment_amount: number;
  customer_name?: string;
  customer_email?: string;
  customer_postal_code?: string;
  status: "completed";

  cash_session_id: number;
  CashSession?: CashSession;
  sold_by: number;
}

export interface ScheduleModel extends TaskModel {
  is_recurring: boolean;
  recurrence_pattern: "daily" | "weekly" | "monthly";
}
