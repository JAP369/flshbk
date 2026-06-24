// =============================================================================
// COLLECTION GRID TYPES
// =============================================================================

export type Grade =
  | "PSA 10"
  | "PSA 9"
  | "PSA 8"
  | "BGS 10"
  | "BGS 9.5"
  | "BGS 9"
  | "CGC 10"
  | "CGC 9.5"
  | "SGC 10"
  | "Raw"
  | "Sealed"
  | "Ungraded";

export type ItemType = "singles" | "sealed_box" | "booster_bundle";

export type AllocationSide = "left_velocity" | "right_vault";

export type PriceDirection = "up" | "down" | "neutral";

export interface CollectionItem {
  id: string;
  name: string;
  setName: string;
  setCode: string;
  cardNumber: string | null;
  rarity: string | null;
  itemType: ItemType;
  imageUrl: string | null;
  grade: Grade;
  quantity: number;
  purchasePriceHkd: number;
  currentValueHkd: number;
  priceChange30d: number;
  priceChangeDirection: PriceDirection;
  allocationSide: AllocationSide;
  conditionGrade: Grade;
}

export interface CollectionSummary {
  totalItems: number;
  totalQuantity: number;
  totalInvestedHkd: number;
  totalCurrentValueHkd: number;
  totalUnrealizedPnlHkd: number;
  pnlPercentage: number;
  leftVelocityCount: number;
  rightVaultCount: number;
}

export type SortOption = "name" | "value" | "pnl" | "quantity" | "recent";

export interface FilterState {
  searchQuery: string;
  sortBy: SortOption;
  allocationFilter: "all" | AllocationSide;
  itemTypeFilter: "all" | ItemType;
}
