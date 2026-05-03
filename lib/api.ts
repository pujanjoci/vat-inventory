/**
 * API Client for Google Apps Script Backend
 */

export const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || '';

export async function fetchFromGAS(url: string, action: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({ action, ...params });
  // Call internal proxy instead of external URL to avoid CORS
  const response = await fetch(`/api/gas?${queryParams.toString()}`);
  if (!response.ok) throw new Error('Network response was not ok');
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Unknown error');
  return result.data;
}

export async function postToGAS(url: string, action: string, data: any) {
  // Call internal proxy instead of external URL to avoid CORS
  const response = await fetch(`/api/gas?action=${action}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
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
  GET_GL_MASTER: 'getGLMaster',
  GET_PURCHASE_BOOK: 'getPurchaseBook',
  GET_SALES_BOOK: 'getSalesBook',
  GET_COSTING_BUDGET: 'getCostingBudget',
  GET_USERS: 'getUsers',
  GET_DASHBOARD_STATS: 'getDashboardStats',
  INIT_SYSTEM: 'initSystem',
  
  SAVE_PURCHASE: 'savePurchase',
  SAVE_SALE: 'saveSale',
  SAVE_PRODUCTION: 'saveProduction',
  SAVE_MASTER: 'addMasterEntry',
  CREATE_USER: 'createUser',
  UPDATE_USER: 'updateUser'
};
