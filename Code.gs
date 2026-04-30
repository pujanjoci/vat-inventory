/**
 * VAT & Inventory Management Portal - Backend
 * Deploy as Web App with "Execute as Me" and "Access: Anyone"
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  try {
    let data = [];
    switch (action) {
      case 'getRMMaster': data = getSheetData(ss, 'RM_Master'); break;
      case 'getFGMaster': data = getSheetData(ss, 'FG_Master'); break;
      case 'getBPMaster': data = getSheetData(ss, 'BP_Master'); break;
      case 'getPartyMaster': data = getSheetData(ss, 'Party_Master'); break;
      case 'getGLMaster': data = getSheetData(ss, 'GL_Master'); break;
      case 'getPurchaseBook': data = getSheetData(ss, 'Purchase_Book'); break;
      case 'getSalesBook': data = getSheetData(ss, 'Sales_Book'); break;
      case 'getProductionJournal': data = getSheetData(ss, 'Production_Journal'); break;
      case 'getStockJournal': data = getSheetData(ss, 'Stock_Journal'); break;
      case 'getFARegister': data = getSheetData(ss, 'FA_Register'); break;
      case 'getCostingBudget': data = getSheetData(ss, 'Costing_Budget'); break;
      case 'getSettings': data = getSheetData(ss, 'Settings')[0] || {}; break;
      default: throw new Error('Invalid action');
    }
    
    return jsonResponse({ success: true, data });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doPost(e) {
  const action = e.parameter.action;
  const body = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  try {
    switch (action) {
      case 'savePurchase': appendToSheet(ss, 'Purchase_Book', body); break;
      case 'saveSale': appendToSheet(ss, 'Sales_Book', body); break;
      case 'saveProduction': saveProductionOrder(ss, body); break;
      case 'saveMaster': saveMasterRecord(ss, body); break;
      case 'saveSettings': updateSettings(ss, body); break;
      case 'saveCosting': updateCosting(ss, body); break;
      default: throw new Error('Invalid action');
    }
    
    // Always rebuild stock journal after data changes
    rebuildStockJournal(ss);
    
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * Helpers
 */

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

function appendToSheet(ss, sheetName, data) {
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => data[header] || '');
  sheet.appendRow(newRow);
}

function saveProductionOrder(ss, data) {
  const sheet = ss.getSheetByName('Production_Journal');
  // Logic to handle production lines (RM consumption, FG output, BP byproduct)
  // Simplified for demo:
  appendToSheet(ss, 'Production_Journal', data);
}

function updateSettings(ss, data) {
  const sheet = ss.getSheetByName('Settings');
  sheet.clear();
  const headers = Object.keys(data);
  sheet.appendRow(headers);
  sheet.appendRow(headers.map(h => data[h]));
}

function rebuildStockJournal(ss) {
  const sjSheet = ss.getSheetByName('Stock_Journal');
  sjSheet.clear();
  
  const headers = ['Date', 'Source', 'Ref', 'MovementType', 'ProductType', 'ProductName', 'Qty', 'Rate', 'Amount', 'Sign', 'UniqueKey'];
  sjSheet.appendRow(headers);
  
  // Logic to iterate through Purchases, Sales, Production and append movements
  // Movement Type: Opening, Purchase, Sales, Consumption, Production, Byproduction
  // Sign: +1 for inflows, -1 for outflows
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Initialize Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📦 Ganesh Tel Portal')
    .addItem('Initialize Tabs', 'initializeSheets')
    .addItem('Rebuild Stock Journal', 'rebuildStockJournalManual')
    .addToUi();
}

function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabs = [
    'Settings', 'RM_Master', 'FG_Master', 'BP_Master', 'Party_Master', 'GL_Master',
    'Purchase_Book', 'Sales_Book', 'Production_Journal', 'Stock_Journal', 
    'FA_Register', 'Costing_Budget', 'VAT_Summary'
  ];
  
  tabs.forEach(tab => {
    if (!ss.getSheetByName(tab)) {
      ss.insertSheet(tab);
    }
  });
}
