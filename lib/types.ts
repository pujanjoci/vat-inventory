export type UOM = 'LTR' | 'PCS' | 'KG' | 'GM' | 'GLN' | 'DRUM' | 'MT' | 'PKT';

export interface RMMaster {
  date: string;
  productName: string;
  productCode: string;
  isTaxable: 'Yes' | 'No';
  isDirectlySaleable: 'Yes' | 'No';
  uom: UOM;
  openingQty: number;
  openingAmount: number;
}

export interface FGMaster {
  date: string;
  productName: string;
  productCode: string;
  isTaxable: 'Yes' | 'No';
  uom: UOM;
  openingQty: number;
  openingAmount: number;
}

export interface BPMaster {
  date: string;
  productName: string;
  productCode: string;
  isTaxable: 'Yes' | 'No';
  uom: UOM;
  openingQty: number;
  openingAmount: number;
}

export interface PartyMaster {
  date: string;
  type: 'Customer' | 'Vendor';
  name: string;
  pan: string;
  phone: string;
  email: string;
  openingBalance: number;
}

export interface GLMaster {
  glAssetName: string;
  subGroup: string;
  mainGroup: string;
  header: string;
  type: 'BS' | 'PL';
  openingDebit: number;
  openingCredit: number;
  faCode: string;
}

export interface PurchaseEntry {
  id?: string;
  date: string;
  month: string;
  billNo: string;
  vendorName: string;
  vendorPan: string;
  productCode: string;
  productName: string;
  qty: number;
  rate: number;
  isTaxable: 'Yes' | 'No';
  isCapitalItem: 'Yes' | 'No';
  isPurchaseReturn: 'Yes' | 'No';
  originalBillRef?: string;
  capitalItemName?: string;
  subGroup?: string;
  mainGroup?: string;
  header?: string;
  type?: string;
  faCode?: string;
}

export interface SalesEntry {
  id?: string;
  date: string;
  month: string;
  billNo: string;
  customerName: string;
  customerPan: string;
  productCode: string;
  productName: string;
  qty: number;
  rate: number;
  isTaxable: 'Yes' | 'No';
  isCapitalItem: 'Yes' | 'No';
  isSalesReturn: 'Yes' | 'No';
  originalBillRef?: string;
  capitalItemName?: string;
  subGroup?: string;
  mainGroup?: string;
  header?: string;
  type?: string;
  faCode?: string;
}

export interface ProductionLine {
  name: string;
  productName: string;
  uom: string;
  qty: number;
  conversionOrNRV: number;
}

export interface ProductionEntry {
  id?: string;
  orderDate: string;
  orderNo: number;
  month: string;
  isDirectlySaleable: 'Yes' | 'No';
  rawMaterials: ProductionLine[];
  finishedGoods: ProductionLine[];
  byProducts: ProductionLine[];
}

export interface CostingBudget {
  month: string;
  fiscalYear: string;
  outputLtrs: number;
  status: 'PRELIMINARY' | 'FINAL';
  workers: number;
  wagePerWorker: number;
  directWages: number;
  ohPower: number;
  ohFuel: number;
  ohMaint: number;
  ohOther: number;
}

export interface AppSettings {
  companyName: string;
  panNo: string;
  userName: string;
  contactNo: string;
  vatRate: number;
  appsScriptUrl: string;
}
