interface BaseModel {
    id: number
    createdAt: Date
    updatedAt?: Date
}

export interface CategoryModel extends BaseModel {
    name: string;
    description: string | null;
    icon: string | null;
    parent_id: number | null;
    subcategories?: CategoryModel[];
}


export interface StoreModel extends BaseModel {
    employees: Array<number>
    // manager?: number
    manager_id: string
    caisses: []
    name: string
    address: string
    phone: string
    email: string
    city: string
    postal_code: string
    is_active: boolean

}

export interface CollectionPointModel extends BaseModel {
    name: string
    address: string
    city: string
    postal_code: string
    contact_person: string
    contact_phone: string
    contact_email: string
    type: string
    notes: string
    is_active: boolean
    recyclery_id: number | string
}

export interface PointPresenceModel extends BaseModel {
    day_of_week: string
    time_slot_name: string
    is_present: boolean
    start_time: string
    end_time: string
    is_24h: boolean
    notes: string
    collection_point_id: number
    store_id: number
}

export interface ArrivalModel extends BaseModel {
    arrival_number: string
    weight: number
    arrival_date: Date
    arrival_time: Date
    source_type: string
    source_details: string
    volunteer_donation: boolean
    house_clearance: boolean
    notes: string
    status: string
}

export interface DonModel extends BaseModel {
    recyclery_id: number
    received_by: number
    donor_name: string
    donor_phone: string
    donor_email: string
    item_description: string
    estimated_value: number
    status: string
    received_at: Date
}

export interface EcoOrgModel extends BaseModel {
    name: string
    description: string
    contact_email: string
    contact_phone: string
    address: string
    website: string
    is_active: boolean
}

export interface LabeledItemModel extends BaseModel {
    recyclery: number
    category: number
    subcategory: number
    soldBy: number
    createdBy: number
    transaction_id: string


    barcode: string
    name: string
    description: string
    weight: number
    price: number
    cost: number
    condition_state: string
    location: string
    status: string
    sold_at: Date
}