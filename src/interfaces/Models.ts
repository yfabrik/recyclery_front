interface BaseModel {
  id: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryModel extends BaseModel {
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: number | null;
  subcategories?: CategoryModel[];
  parent?: CategoryModel;
  LabeledItems?: LabeledItemModel[];
  defaultWeight: number;
  defaultPrice: number;
  IO: number;
  priceBasedOnWeight: boolean;
  bundlePrice: number;
  bundleQuantity: number;
  Promotions?: PromoModel[];
}

export interface SkillModel extends BaseModel {
  name: string;
  isActive: boolean;
  description: string | null;
  Employees?: EmployeeModel[];

}

export interface StoreModel extends BaseModel {
  employees?: Array<EmployeeModel>;
  manager_id: number | null;
  manager?: UserModel;
  caisses?: CaisseModel[];
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  postal_code: string | null;
  is_active: boolean;
  TaskSchedules?: ScheduleModel[];
  Tasks?: TaskModel[];
  CollectionPoints?: CollectionPointModel[];
  LabeledItems?: LabeledItemModel[];
  Donations?: DonModel[];
}

export interface CollectionPointModel extends BaseModel {
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  type:
    | "standard"
    | "entreprise"
    | "association"
    | "school"
    | "hospital"
    | "other";
  notes: string | null;
  is_active: boolean;
  recyclery_id?: number | null;
  Recyclery?: StoreModel;
  TaskSchedules?: ScheduleModel[];
  Tasks?: TaskModel[];
  Arrivals?: ArrivalModel[];
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
  arrival_date: string;
  arrival_time: string;
  source_type: "point" | "apport" | "house_clearance";
  source_details: string;
  notes: string;
  status: string;
  category_id: number;
  subcategory_id: number;
  collection_point_id: number;
  processed_by: number;
  categorie?: CategoryModel;
  subcategorie?: CategoryModel;
  User?: UserModel;
  CollectionPoint?: CollectionPointModel;
}

export interface DonModel extends BaseModel {
  recyclery_id: number | null;
  received_by: number;
  donor_name: string;
  donor_phone: string | null;
  donor_email: string | null;
  item_description: string;
  estimated_value: number;
  status: "pending" | "accepted" | "rejected";
  received_at: Date | null;
  donor_contact?: string | null;
  weight?: number | null;
  User?: UserModel;
  Recyclery?: StoreModel;
}

export interface EcoOrgModel extends BaseModel {
  name: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website: string | null;
  is_active: boolean;
  WasteDisposals?: WasteModel[];
}

export interface LabeledItemModel extends BaseModel {
  recyclery_id: number | null;
  category_id: number;
  subcategory_id: number | null;
  soldBy: number | null;
  created_by: number;
  transaction_id: number | null;

  barcode: string;
  description: string|null;
  weight: number;
  price: number;
  cost: number | null;
  condition_state: "excellent" | "good" | "fair" | "poor";
  status: "available" | "sold";
  category?: Pick<CategoryModel, "name">;
  subcategory?: Pick<CategoryModel, "name"> | null;
  createdBy?: Pick<UserModel, "username">;
  recyclery?: StoreModel;
  SalesTransaction?: TransactionModel;
}

export interface UserModel extends BaseModel {
  username: string;
  email: string;
  // password?: string;
  phone?: string;
  role: "admin" | "employee" | "manager";
  isActive: boolean;
  last_login: string;
  Donations?: DonModel[];
  SalesTransactions?: TransactionModel[];
  LabeledItems?: LabeledItemModel[];
  Arrivals?: ArrivalModel[];
  managedStores?: StoreModel[];
}

export interface TaskModel extends BaseModel {
  name: string;
  description: string | null;
  category: "vente" | "point" | "collection" | "custom";
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
  CollectionPointId?: number | null;
  RecycleryId?: number | null;
  schedule_id: number;
  store_id?: number | null;
  collection_point_id?: number | null;
  Recyclery?: StoreModel;
  TaskSchedule?: ScheduleModel;
  CollectionPoint?: CollectionPointModel;
  day_of_week: string;
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
  contract_hours?: number | null;
  address?: string | null;
  availability?: "full_time" | "part_time" | "weekend" | "evening" | "flexible" | string | null;
  hourly_rate?: number | null;
  skills?: string[];
  EmployeeWorkdays?: WorkdaysModel[];
  stores?: StoreModel[];
  EmployeeStore?: {
    is_primary: boolean;
  }[];
  Tasks?: TaskModel[];
  TaskSchedules?: ScheduleModel[];
  Skills?: SkillModel[];
}

export interface WorkdaysModel extends BaseModel {
  day_of_week: string;
  time_slot: "morning" | "afternoon";
  is_working: boolean;
  start_time: string;
  end_time: string;
  notes: string;
  employee_id?: number;
  week?: "week1" | "week2";
  Employee?: EmployeeModel;
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
  Recyclery?: StoreModel;
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
  closing_amount?: number | null;
  expected_amount?: number | null;
  difference_amount: number;
  status: "open" | "close";
  closed_at?: Date | null;
  notes?: string | null;
  cash_register_id: number;
  user_id: number;

  CashRegister?: Pick<CaisseModel, "name">;
  User?: UserModel;
  Recyclery?: Pick<StoreModel, "name">;
  SalesTransactions?: TransactionModel[];
}

export interface TransactionModel extends BaseModel {
  change_amount: number;
  total_amount: number;
  payment_method: "cash" | "card" | "check" | "giftCard";
  transactionType: "sell" | "refund";
  payment_amount: number;
  // customer_name?: string;
  // customer_email?: string;
  customer_postal_code?: string | null;
  status: "pending" | "completed" | "cancelled";

  cash_session_id?: number | null;
  CashSession?: CashSession;
  created_by: number;
  sold_by?: number;
  User?: UserModel;
  LabeledItems?: LabeledItemModel[];
  items?: (LabeledItemModel & { TransactionItem: TransactionItem })[];
  refunds?: TransactionModel[];
}

export interface TransactionItem extends Omit<BaseModel, "id"> {
  bundlePrice: number;
  bundleQuantity: number;
  labeled_item_id: number;
  name: string;
  price: number;
  promotionValue: number;
  quantity: number;
  total_price: number;
  transaction_id: number;
}

export interface ScheduleModel extends TaskModel {
  is_recurring: boolean;
  recurrence_pattern: "daily" | "weekly" | "monthly";
  Tasks?: TaskModel[];
}

export interface WasteModel extends BaseModel {
  disposal_date: Date;
  disposal_type: "eco_organism" | "landfill" | "recycling" | "other";
  weight_kg: number;
  volume_m3: number | null;
  transport_method: string | null;
  transport_company: string | null;
  transport_cost: number | null;
  notes: string | null;
  category_id: number;
  category?: CategoryModel;
  subcategory?: CategoryModel | null;
  subcategory_id: number | null;
  eco_organism?: EcoOrgModel | null;
  eco_organism_id: number | null;
  created_by: number;
  User?: UserModel;
}

export interface PromoModel extends BaseModel {
  category_id: number;
  promotionValue: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  Category?: CategoryModel;
  stores?: StoreModel[];
}
