/**
 * API Client for Google Apps Script Backend
 */

export async function fetchFromGAS(url: string, action: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({ action, ...params });
  const response = await fetch(`${url}?${queryParams.toString()}`);
  if (!response.ok) throw new Error('Network response was not ok');
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Unknown error');
  return result.data;
}

export async function postToGAS(url: string, action: string, data: any) {
  const response = await fetch(`${url}?action=${action}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // Apps Script handles text/plain for POST better sometimes due to CORS
    },
  });
  if (!response.ok) throw new Error('Network response was not ok');
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Unknown error');
  return result.data;
}

// Action constants for API calls
export const ACTIONS = {
  GET_RM_MASTER: 'getRMMaster',
  GET_FG_MASTER: 'getFGMaster',
  GET_BP_MASTER: 'getBPMaster',
  GET_PARTY_MASTER: 'getPartyMaster',
  GET_GL_MASTER: 'getGLMaster',
  GET_PURCHASE_BOOK: 'getPurchaseBook',
  GET_SALES_BOOK: 'getSalesBook',
  GET_PRODUCTION_JOURNAL: 'getProductionJournal',
  GET_STOCK_JOURNAL: 'getStockJournal',
  GET_FA_REGISTER: 'getFARegister',
  GET_VAT_SUMMARY: 'getVATSummary',
  GET_COSTING_BUDGET: 'getCostingBudget',
  GET_SETTINGS: 'getSettings',
  
  SAVE_PURCHASE: 'savePurchase',
  SAVE_SALE: 'saveSale',
  SAVE_PRODUCTION: 'saveProduction',
  SAVE_MASTER: 'saveMaster',
  SAVE_SETTINGS: 'saveSettings',
  SAVE_COSTING: 'saveCosting',
};
