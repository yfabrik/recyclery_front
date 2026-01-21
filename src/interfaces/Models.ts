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
}

export interface StoreModel extends BaseModel {
  employees?: Array< EmployeeModel>;
  manager_id: string;
  caisses: [];
  name: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  postal_code: string;
  is_active: boolean;
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
  recyclery_id: number | string;
}

export interface PointPresenceModel extends BaseModel {
  day_of_week: string;
  time_slot_name: string;
  is_present: boolean;
  start_time: string;
  end_time: string;
  is_24h: boolean;
  notes: string;
  collection_point_id: number;
  store_id: number;
}

export interface ArrivalModel extends BaseModel {
  arrival_number: string;
  weight: number;
  arrival_date: Date;
  arrival_time: Date;
  source_type: string;
  source_details: string;
  volunteer_donation: boolean;
  house_clearance: boolean;
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
  condition_state: string;
  location: string;
  status: string;
  sold_at: Date;
}

export interface UserModel extends BaseModel {
  username: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  recyclery_id?: number;
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
  time_slot: string;
  is_working: boolean;
  start_time: string;
  end_time: string;
  notes: string;
}
