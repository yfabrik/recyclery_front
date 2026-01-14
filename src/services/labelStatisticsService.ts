export interface LabeledItem {
  id: number;
  status: 'available' | 'reserved' | 'sold';
  price: number | string;
  [key: string]: any;
}

export interface LabelStatistics {
  available: number;
  sold: number;
  reserved: number;
  totalValue: number;
}

/**
 * Calculate statistics from labeled items
 */
export const calculateLabelStatistics = (items: LabeledItem[]): LabelStatistics => {
  return {
    available: items.filter(item => item.status === 'available').length,
    sold: items.filter(item => item.status === 'sold').length,
    reserved: items.filter(item => item.status === 'reserved').length,
    totalValue: items.reduce((sum, item) => {
      return sum + parseFloat(String(item.price || 0));
    }, 0)
  };
};

/**
 * Format total value as currency string
 */
export const formatTotalValue = (value: number): string => {
  return `${value.toFixed(2)} €`;
};
