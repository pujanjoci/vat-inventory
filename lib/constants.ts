import { UOM } from "./types";

export const NEPALI_MONTHS = [
  'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 
  'Magh', 'Falgun', 'Chaitra', 'Baisakh', 'Jestha', 'Ashadh'
];

export const UOM_OPTIONS: UOM[] = ['LTR', 'PCS', 'KG', 'GM', 'GLN', 'DRUM', 'MT', 'PKT'];

export const VAT_RATE = 0.13;

export const DEFAULT_SETTINGS = {
  companyName: 'Ganesh Tel Mill',
  panNo: '604141622',
  userName: 'Admin',
  contactNo: '',
  vatRate: 13,
  appsScriptUrl: process.env.NEXT_PUBLIC_GAS_URL || '',
};

export const PRODUCT_TYPES = ['RM', 'FG', 'BP'] as const;

export const SUB_GROUPS = ['Block A', 'Block B', 'Block C', 'Block D'] as const;
