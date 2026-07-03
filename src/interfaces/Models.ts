import type { WasteDisposalDto } from "@recyclerie/api/responses/waste";
import type { DonationDto } from "@recyclerie/api/responses/donations";
import type { SkillDto } from "@recyclerie/api/responses/skills";
import type { PromotionDto } from "@recyclerie/api/responses/promotions";
import type { EmployeeWorkdayDto } from "@recyclerie/api/responses/employeeWorkdays";
import type { CategoryDto } from "@recyclerie/api/responses/categories";
import type { CollectionPointDto } from "@recyclerie/api/responses/collectionPoints";
import type { ArrivalDto } from "@recyclerie/api/responses/arrivals";
import type { EcoOrganismDto } from "@recyclerie/api/responses/ecoOrganism";
import type { LabeledItemDto } from "@recyclerie/api/responses/items";
import type { UserDto } from "@recyclerie/api/responses/users";
import type { EmployeeDto } from "@recyclerie/api/responses/employees";
import type { RecycleryDto } from "@recyclerie/api/responses/recycleries";
import type {
  CashRegisterDto,
  CashSessionRefDto,
} from "@recyclerie/api/responses/cashRegister";
import type { CashSessionDto } from "@recyclerie/api/responses/cashSession";
import type { TaskDto } from "@recyclerie/api/responses/tasks";
import type {
  TaskScheduleDto,
  StoreHoursDto,
} from "@recyclerie/api/responses/taskSchedule";
import type {
  SalesTransactionDto,
  TransactionPaymentDto,
} from "@recyclerie/api/responses/salesTransactions";
import type { AuthUserDto } from "@recyclerie/api/responses/auth";
import type { GiftCardDto } from "@recyclerie/api/responses/giftCards";

interface BaseModel {
  id: number;
  createdAt: string;
  updatedAt?: string;
}

export type CategoryModel = CategoryDto;

export type SkillModel = SkillDto;

export type StoreModel = RecycleryDto;

export type CollectionPointModel = CollectionPointDto;

export type ArrivalModel = ArrivalDto;

export type DonModel = DonationDto;

export type EcoOrgModel = EcoOrganismDto;

export type LabeledItemModel = LabeledItemDto;

export type UserModel = UserDto;

export type TaskModel = TaskDto;

export type EmployeeModel = EmployeeDto;

export type WorkdaysModel = EmployeeWorkdayDto;

export type StoreHoursModel = StoreHoursDto;

export type CaisseModel = CashRegisterDto;

export type CashSession = CashSessionDto;

export type ScheduleModel = TaskScheduleDto;

export type TransactionModel = SalesTransactionDto;

export type TransactionPayment = TransactionPaymentDto;

/** Logged-in user from auth endpoints (subset of UserDto). */
export type AuthUserModel = AuthUserDto;

export type GiftCardModel = GiftCardDto;

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

export type WasteModel = WasteDisposalDto;

export type PromoModel = PromotionDto;

export type { CashSessionRefDto };
