import { PurchaseEntry, SalesEntry, ProductionEntry } from "./types";
import { VAT_RATE, NEPALI_MONTHS } from "./constants";

/**
 * Maps a Gregorian date to a Nepali month name (approximate)
 */
export const getNepaliMonth = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Mapping based on approx mid-month transitions
  // July 17 - Aug 16 = Shrawan (Month 6)
  if ((month === 6 && day >= 17) || (month === 7 && day <= 16)) return 'Shrawan';
  if ((month === 7 && day >= 17) || (month === 8 && day <= 16)) return 'Bhadra';
  if ((month === 8 && day >= 17) || (month === 9 && day <= 16)) return 'Ashwin';
  if ((month === 9 && day >= 17) || (month === 10 && day <= 16)) return 'Kartik';
  if ((month === 10 && day >= 17) || (month === 11 && day <= 16)) return 'Mangsir';
  if ((month === 11 && day >= 17) || (month === 0 && day <= 16)) return 'Poush';
  if ((month === 0 && day >= 17) || (month === 1 && day <= 16)) return 'Magh';
  if ((month === 1 && day >= 17) || (month === 2 && day <= 16)) return 'Falgun';
  if ((month === 2 && day >= 17) || (month === 3 && day <= 16)) return 'Chaitra';
  if ((month === 3 && day >= 17) || (month === 4 && day <= 16)) return 'Baisakh';
  if ((month === 4 && day >= 17) || (month === 5 && day <= 16)) return 'Jestha';
  if ((month === 5 && day >= 17) || (month === 6 && day <= 16)) return 'Ashadh';

  return 'Shrawan'; // Default
};

/**
 * Purchase calculations
 */
export const calculatePurchase = (entry: Partial<PurchaseEntry>) => {
  const qty = entry.qty || 0;
  const rate = entry.rate || 0;
  const isTaxable = entry.isTaxable === 'Yes';
  const isCapital = entry.isCapitalItem === 'Yes';

  const taxableValue = isTaxable && !isCapital ? qty * rate : 0;
  const vat = taxableValue * VAT_RATE;
  const total = taxableValue + vat;

  const nonTaxableValue = !isTaxable ? qty * rate : 0;

  const capTaxableValue = isCapital && isTaxable ? qty * rate : 0;
  const capVat = capTaxableValue * VAT_RATE;
  const capTotal = capTaxableValue + capVat;

  const grandTotal = total + capTotal + nonTaxableValue;

  return {
    taxableValue,
    vat,
    total,
    nonTaxableValue,
    capTaxableValue,
    capVat,
    capTotal,
    grandTotal
  };
};

/**
 * Sales calculations
 */
export const calculateSales = (entry: Partial<SalesEntry>, cogsRate: number = 0) => {
  const qty = entry.qty || 0;
  const rate = entry.rate || 0;
  const isTaxable = entry.isTaxable === 'Yes';
  const isCapital = entry.isCapitalItem === 'Yes';

  const taxableValue = isTaxable && !isCapital ? qty * rate : 0;
  const vat = taxableValue * VAT_RATE;
  const total = taxableValue + vat;

  const nonTaxableValue = !isTaxable ? qty * rate : 0;

  const capTaxableValue = isCapital && isTaxable ? qty * rate : 0;
  const capVat = capTaxableValue * VAT_RATE;
  const capTotal = capTaxableValue + capVat;

  const grandTotal = total + capTotal + nonTaxableValue;

  const salesAmount = (isTaxable ? (taxableValue + capTaxableValue) : nonTaxableValue);
  const cogsAmount = qty * cogsRate;
  const grossProfit = salesAmount - cogsAmount;
  const gpPercent = salesAmount > 0 ? (grossProfit / salesAmount) * 100 : 0;

  return {
    taxableValue,
    vat,
    total,
    nonTaxableValue,
    capTaxableValue,
    capVat,
    capTotal,
    grandTotal,
    salesAmount,
    cogsAmount,
    grossProfit,
    gpPercent
  };
};

/**
 * Production Order calculations
 */
export const calculateProduction = (
  rawMaterials: { qty: number; rate: number }[],
  byProducts: { qty: number; nrv: number }[],
  fgQty: number,
  prelimOhAmt: number = 0,
  finalOhAmt: number = 0
) => {
  const totalRmCost = rawMaterials.reduce((sum, rm) => sum + (rm.qty * rm.rate), 0);
  const totalBpNrv = byProducts.reduce((sum, bp) => sum + (bp.qty * bp.nrv), 0);
  const netRmCost = totalRmCost - totalBpNrv;

  const prelimRatePerLtr = fgQty > 0 ? netRmCost / fgQty : 0;
  
  const ohRatePerLtr = fgQty > 0 ? finalOhAmt / fgQty : 0;
  const fullCost = netRmCost + finalOhAmt;
  const fullRatePerLtr = fgQty > 0 ? fullCost / fgQty : 0;

  const ohVariance = prelimOhAmt - finalOhAmt;

  return {
    totalRmCost,
    totalBpNrv,
    netRmCost,
    prelimRatePerLtr,
    ohRatePerLtr,
    fullCost,
    fullRatePerLtr,
    ohVariance
  };
};

/**
 * Formatting helpers
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};
