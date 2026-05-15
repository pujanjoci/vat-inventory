/**
 * Global Spreadsheet reference
 */
const SS = SpreadsheetApp.getActiveSpreadsheet();

/**
 * Configuration of sheets with CompanyName for multi-tenancy
 */
const SHEETS_CONFIG = {
  "Users": ["Username", "Password", "Role", "CompanyName", "PAN_No", "ContactNo", "Status"],
  "RM_Master": ["CompanyName", "Date", "RM Product Name", "RM Product Code", "Is it Taxable?", "Is it Directly Saleable?", "UOM", "Opening Balance (Qty)", "Opening Balance (Rs.)"],
  "FG_Master": ["CompanyName", "Date", "FG Product Name", "FG Product Code", "Is it Taxable?", "UOM", "Opening Balance (Qty)", "Opening Balance (Rs.)"],
  "ByProduct_Master": ["CompanyName", "Date", "ByProduct Name", "ByProduct Code", "Is it Taxable?", "UOM", "Opening Balance (Qty)", "Opening Balance (Rs.)"],
  "BP_Master": ["CompanyName", "BPCode", "BPName", "Type", "ContactPerson", "Phone", "Email", "Address"],
  "Purchase_Book": ["CompanyName", "Date", "Bill No", "Month", "Vendor Name", "Vendor PAN", "Product Name", "Qty", "Unit", "Rate", "Taxable Amt", "VAT Amt", "Total Amt", "Is Taxable?", "Is Capital Item?", "Remarks"],
  "Sales_Book": ["CompanyName", "Date", "Bill No", "Month", "Customer Name", "Customer PAN", "Product Name", "Qty", "Unit", "Rate", "Taxable Amt", "VAT Amt", "Total Amt", "Is Taxable?", "Is Sales Return/ Credit Note?", "Remarks"],
  "Production_Journal": ["CompanyName", "Date", "Order No", "Month", "Raw Materials", "Finished Goods", "By Products", "Yield Percent", "Cost Per Unit"],
  "GL_Master": ["CompanyName", "GL Asset Name", "Sub Group", "Main Group", "Header", "Type", "Opening Debit", "Opening Credit", "FA Code"],
  "AR_AP": ["CompanyName", "BPCode", "Name", "Type", "Balance", "Due Date", "Last Payment", "Status"],
  "Costing_Budget": ["CompanyName", "Month", "Fiscal Year", "Output (Ltrs)", "Status", "Workers", "Wage/Worker", "Direct Wages", "OH-Power", "OH-Fuel", "OH-Maint", "OH-Other", "Total OH", "OH Rate/Ltr", "RM Cost (Auto)", "Total Cost", "Total Rate/Ltr"],
  "Settings": ["Key", "Value"],
  "Audit_Log": ["Timestamp", "User", "Role", "Company", "Action", "Module", "Details"]
};

/**
 * Serves the HTML application OR returns JSON if action is provided
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    try {
      const action = e.parameter.action;
      const role = e.parameter.role || "Company";
      const companyName = e.parameter.companyName || "";
      
      let data;
      
      switch (action) {
        case 'getRMMaster': data = getFilteredData('RM_Master', role, companyName); break;
        case 'getFGMaster': data = getFilteredData('FG_Master', role, companyName); break;
        case 'getBPMaster': data = getFilteredData('ByProduct_Master', role, companyName); break;
        case 'getParties': data = getFilteredData('BP_Master', role, companyName); break;
        case 'getPurchaseBook': data = getFilteredData('Purchase_Book', role, companyName); break;
        case 'getSalesBook': data = getFilteredData('Sales_Book', role, companyName); break;
        case 'getGLMaster': data = getFilteredData('GL_Master', role, companyName); break;
        case 'getCostingBudget': data = getFilteredData('Costing_Budget', role, companyName); break;
        case 'getARAP': data = getFilteredData('AR_AP', role, companyName); break;
        case 'getDashboardStats': data = getDashboardStats(role, companyName); break;
        case 'getAuditLog': data = getFilteredData('Audit_Log', role, companyName); break;
        case 'getUsers': data = getUsers(); break;
        case 'initSystem': data = initSheets(true); break;
        case 'syncHeaders': data = syncHeaders(); break;
        default: throw new Error('Invalid action: ' + action);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, data }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  initSheets();
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('ERP Inventory Portal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    const body = JSON.parse(e.postData.contents);
    const role = e.parameter.role || "Company";
    let result;

    switch (action) {
      case 'loginUser': result = loginUser(body.username, body.password, body.role, body.companyName, body.panNo); break;
      case 'savePurchase': result = savePurchase(body, role); break;
      case 'saveSale': result = saveSale(body, role); break;
      case 'saveProduction': result = saveProduction(body, role); break;
      case 'createUser': result = createUser(body); break;
      case 'updateUser': result = updateUser(body); break;
      case 'deleteUser': result = deleteUser(body); break;
      case 'addMasterEntry': result = addMasterEntry(e.parameter.sheetName, body, role); break;
      case 'deleteMasterEntry': result = deleteMasterEntry(e.parameter.sheetName, body, role); break;
      case 'updateMasterEntry': result = updateMasterEntry(e.parameter.sheetName, body, role); break;
      default: throw new Error('Invalid post action: ' + action);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Multi-tenant Data Retrieval
 */
function getFilteredData(sheetName, role, companyName) {
  const data = getSheetData(sheetName);
  if (role === "Admin") return data;
  return data.filter(row => String(row.CompanyName || "").trim().toLowerCase() === String(companyName).trim().toLowerCase());
}

/**
 * Save Purchase with automated calculations and stock updates
 */
function savePurchase(payload, role) {
  const sheetName = "Purchase_Book";
  const companyName = role === "Admin" ? "" : (payload.companyName || "");
  
  payload.items.forEach(item => {
    const rowData = {
      "CompanyName": companyName,
      "Date": payload.date,
      "Bill No": payload.billNo,
      "Month": payload.fiscalMonth,
      "Vendor Name": payload.vendorName,
      "Product Name": item.productCode, // Store code as name for lookup
      "Qty": item.qty,
      "Rate": item.rate,
      "Is Taxable?": item.isTaxable,
      "Is Capital Item?": item.isCapital,
      "Taxable Amt": item.qty * item.rate,
      "VAT Amt": item.isTaxable === "Yes" ? (item.qty * item.rate * 0.13) : 0,
      "Total Amt": (item.qty * item.rate) + (item.isTaxable === "Yes" ? (item.qty * item.rate * 0.13) : 0)
    };
    
    appendRowToSheet(sheetName, rowData);
    updateStock(companyName, item.productCode, item.qty, 'add');
  });
  
  return { success: true };
}

/**
 * Save Sale with automated calculations and stock updates
 */
function saveSale(payload, role) {
  const sheetName = "Sales_Book";
  const companyName = role === "Admin" ? "" : (payload.companyName || "");
  
  payload.items.forEach(item => {
    const rowData = {
      "CompanyName": companyName,
      "Date": payload.date,
      "Bill No": payload.billNo,
      "Month": payload.fiscalMonth,
      "Customer Name": payload.customerName,
      "Product Name": item.productCode,
      "Qty": item.qty,
      "Rate": item.rate,
      "Is Taxable?": item.isTaxable,
      "Taxable Amt": item.qty * item.rate,
      "VAT Amt": item.isTaxable === "Yes" ? (item.qty * item.rate * 0.13) : 0,
      "Total Amt": (item.qty * item.rate) + (item.isTaxable === "Yes" ? (item.qty * item.rate * 0.13) : 0)
    };
    
    appendRowToSheet(sheetName, rowData);
    updateStock(companyName, item.productCode, item.qty, 'remove');
  });
  
  return { success: true };
}

/**
 * Save Production Batch
 */
function saveProduction(payload, role) {
  const sheetName = "Production_Journal";
  const companyName = role === "Admin" ? "" : (payload.companyName || "");
  
  const rowData = {
    "CompanyName": companyName,
    "Date": payload.date,
    "Order No": payload.orderNo,
    "Month": payload.fiscalMonth,
    "Raw Materials": JSON.stringify(payload.rmItems),
    "Finished Goods": JSON.stringify(payload.fgItems),
    "By Products": JSON.stringify(payload.bpItems),
    "Yield Percent": payload.results.yieldPercent,
    "Cost Per Unit": payload.results.prelimRatePerLtr
  };
  
  appendRowToSheet(sheetName, rowData);
  
  // Update Stocks
  payload.rmItems.forEach(rm => updateStock(companyName, rm.code, rm.qty, 'remove'));
  payload.fgItems.forEach(fg => updateStock(companyName, fg.code, fg.qty, 'add'));
  payload.bpItems.forEach(bp => updateStock(companyName, bp.code, bp.qty, 'add'));
  
  return { success: true };
}

/**
 * Add Master Entry
 */
function addMasterEntry(sheetName, rowData, role) {
  if (role === "Admin") {
    rowData["CompanyName"] = "";
  }
  const sheet = SS.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  
  const headers = SHEETS_CONFIG[sheetName];
  const row = headers.map(h => rowData[h] === undefined ? "" : rowData[h]);
  sheet.appendRow(row);
  
  logEvent(role, rowData.CompanyName || "Admin", "CREATE", sheetName, JSON.stringify(rowData));
  
  return { success: true };
}

/**
 * Delete Master Entry — finds row by matching key/value pair
 */
function deleteMasterEntry(sheetName, body, role) {
  const sheet = SS.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  
  const matchKey = body._matchKey;
  const matchValue = String(body._matchValue || "").trim();
  if (!matchKey || !matchValue) throw new Error("Missing _matchKey or _matchValue for delete");
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIdx = headers.indexOf(matchKey);
  if (keyIdx === -1) throw new Error("Column not found: " + matchKey);
  
  // For non-admin users, also match company
  const companyIdx = headers.indexOf("CompanyName");
  
  for (let i = data.length - 1; i >= 1; i--) {
    const cellVal = String(data[i][keyIdx] || "").trim();
    if (cellVal === matchValue) {
      // If not admin, verify company ownership
      if (role !== "Admin" && companyIdx >= 0) {
        const rowCompany = String(data[i][companyIdx] || "").trim().toLowerCase();
        const userCompany = String(body._companyName || "").trim().toLowerCase();
        if (rowCompany !== userCompany) continue;
      }
      sheet.deleteRow(i + 1);
      
      logEvent(role, body._companyName || "Admin", "DELETE", sheetName, "Deleted entry: " + matchValue);
      
      return { success: true, deleted: matchValue };
    }
  }
  
  throw new Error("Entry not found: " + matchValue);
}

/**
 * Update Master Entry — deletes old row and appends updated data
 */
function updateMasterEntry(sheetName, body, role) {
  // body contains _matchKey, _matchValue, _companyName, and all the new field data
  const deletePayload = {
    _matchKey: body._matchKey,
    _matchValue: body._matchValue,
    _companyName: body._companyName
  };
  
  // Delete the old row
  deleteMasterEntry(sheetName, deletePayload, role);
  
  // Remove meta keys before adding
  const rowData = { ...body };
  delete rowData._matchKey;
  delete rowData._matchValue;
  delete rowData._companyName;
  
  // Add the updated row
  const result = addMasterEntry(sheetName, rowData, role);
  
  logEvent(role, body._companyName || "Admin", "UPDATE", sheetName, "Updated entry: " + body._matchValue);
  
  return result;
}

/**
 * Audit Log Helper
 */
function logEvent(role, companyName, action, module, details) {
  try {
    const sheet = SS.getSheetByName("Audit_Log");
    if (!sheet) return;
    const timestamp = new Date().toISOString();
    sheet.appendRow([timestamp, role, role, companyName, action, module, details]);
  } catch(e) {
    // Silently fail if audit log is missing
  }
}

/**
 * Generic Helper to append row using headers
 */
function appendRowToSheet(sheetName, rowObj) {
  const sheet = SS.getSheetByName(sheetName);
  const headers = SHEETS_CONFIG[sheetName];
  const row = headers.map(h => rowObj[h] === undefined ? "" : rowObj[h]);
  sheet.appendRow(row);
}

/**
 * Multi-tenant Stock Management
 */
function updateStock(companyName, productCode, qty, action) {
  const rmSheet = SS.getSheetByName("RM_Master");
  const fgSheet = SS.getSheetByName("FG_Master");
  const bpSheet = SS.getSheetByName("ByProduct_Master");
  
  const findAndUpdate = (sheet, codeCol, stockCol) => {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const cIdx = headers.indexOf("CompanyName");
    const pIdx = headers.indexOf(codeCol);
    const sIdx = headers.indexOf(stockCol);
    
    for (let i = 1; i < data.length; i++) {
      const rowCompany = String(data[i][cIdx] || "").trim().toLowerCase();
      const rowCode = String(data[i][pIdx] || "").trim();
      
      if (rowCompany === String(companyName).trim().toLowerCase() && rowCode === String(productCode).trim()) {
        const currentStock = parseFloat(data[i][sIdx]) || 0;
        const newStock = action === 'add' ? currentStock + parseFloat(qty) : currentStock - parseFloat(qty);
        sheet.getRange(i + 1, sIdx + 1).setValue(newStock);
        return true;
      }
    }
    return false;
  };

  if (!findAndUpdate(rmSheet, "RM Product Code", "Opening Balance (Qty)")) {
    if (!findAndUpdate(fgSheet, "FG Product Code", "Opening Balance (Qty)")) {
      findAndUpdate(bpSheet, "ByProduct Code", "Opening Balance (Qty)");
    }
  }
}

/**
 * Company-specific Dashboard Stats
 */
function getDashboardStats(role, companyName) {
  const purchases = getFilteredData("Purchase_Book", role, companyName);
  const sales = getFilteredData("Sales_Book", role, companyName);
  const rm = getFilteredData("RM_Master", role, companyName);
  const fg = getFilteredData("FG_Master", role, companyName);
  
  const stats = {
    totalPurchases: purchases.reduce((sum, p) => sum + (parseFloat(p["Total Amt"]) || 0), 0),
    totalSales: sales.reduce((sum, s) => sum + (parseFloat(s["Total Amt"]) || 0), 0),
    inputVat: purchases.reduce((sum, p) => sum + (parseFloat(p["VAT Amt"]) || 0), 0),
    outputVat: sales.reduce((sum, s) => sum + (parseFloat(s["VAT Amt"]) || 0), 0),
    inventoryValue: rm.reduce((sum, r) => sum + (parseFloat(r["Opening Balance (Rs.)"]) || 0), 0) +
                     fg.reduce((sum, f) => sum + (parseFloat(f["Opening Balance (Rs.)"]) || 0), 0)
  };
  
  stats.vatPayable = stats.outputVat - stats.inputVat;
  return stats;
}

/**
 * Basic Data Helpers
 */
function getSheetData(name) {
  const sheet = SS.getSheetByName(name);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 1) return [];
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function getUsers() {
  return getSheetData("Users").map(u => {
    delete u.Password;
    return u;
  });
}

function loginUser(username, password, role, companyName, panNo) {
  const data = getSheetData("Users");
  const hashedPassword = hashPassword(password);
  
  const user = data.find(u => {
    const nameMatch = String(u.Username).trim().toLowerCase() === String(username).trim().toLowerCase();
    const passMatch = u.Password === hashedPassword;
    const roleMatch = u.Role === role;
    
    if (role === "Admin") {
      return nameMatch && passMatch && roleMatch;
    } else {
      const companyMatch = String(u.CompanyName || "").trim().toLowerCase() === String(companyName || "").trim().toLowerCase();
      const panMatch = String(u.PAN_No || "").trim() === String(panNo || "").trim();
      return nameMatch && passMatch && roleMatch && companyMatch && panMatch;
    }
  });

  if (user) {
    if (user.Status === "Inactive" || user.Status === "Deactivated") throw new Error("Account is inactive / unsubscribed.");
    delete user.Password;
    return user;
  }
  throw new Error("Invalid credentials.");
}

function hashPassword(password) {
  if (!password) return "";
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  let hash = "";
  for (let i = 0; i < digest.length; i++) {
    let byte = digest[i];
    if (byte < 0) byte += 256;
    let bStr = byte.toString(16);
    if (bStr.length === 1) bStr = "0" + bStr;
    hash += bStr;
  }
  return hash;
}

/**
 * User Management CRUD
 */
function createUser(body) {
  const sheet = SS.getSheetByName("Users");
  if (!sheet) throw new Error("Users sheet not found");
  
  // Check if username already exists
  const users = getUsers();
  if (users.some(u => u.Username.toLowerCase() === body.Username.toLowerCase())) {
    throw new Error("Username already exists");
  }
  
  const headers = SHEETS_CONFIG["Users"];
  const rowData = {
    ...body,
    Password: hashPassword(body.Password || "password123"),
    Status: body.Status || "Active"
  };
  
  const row = headers.map(h => rowData[h] === undefined ? "" : rowData[h]);
  sheet.appendRow(row);
  return { success: true };
}

function updateUser(body) {
  const sheet = SS.getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdx = headers.indexOf("Username");
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][userIdx]).toLowerCase() === String(body.Username).toLowerCase()) {
      // Update fields provided in body
      headers.forEach((h, colIdx) => {
        if (body[h] !== undefined) {
          let val = body[h];
          if (h === "Password") val = hashPassword(val);
          sheet.getRange(i + 1, colIdx + 1).setValue(val);
        }
      });
      return { success: true };
    }
  }
  throw new Error("User not found: " + body.Username);
}

function deleteUser(body) {
  const sheet = SS.getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdx = headers.indexOf("Username");
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][userIdx]).toLowerCase() === String(body.Username).toLowerCase()) {
      if (body.Username === "admin") throw new Error("Cannot delete system admin");
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  throw new Error("User not found: " + body.Username);
}

function syncHeaders() {
  Object.keys(SHEETS_CONFIG).forEach(name => {
    let sheet = SS.getSheetByName(name);
    if (!sheet) {
      sheet = SS.insertSheet(name);
      sheet.appendRow(SHEETS_CONFIG[name]);
    } else {
      const headers = SHEETS_CONFIG[name];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  });
  return "All sheet headers synchronized with system configuration.";
}

function initSheets(forcePopulate = false) {
  Object.keys(SHEETS_CONFIG).forEach(name => {
    let sheet = SS.getSheetByName(name);
    if (!sheet) {
      sheet = SS.insertSheet(name);
      sheet.appendRow(SHEETS_CONFIG[name]);
      if (name === "Users") {
        sheet.appendRow(["admin", hashPassword("admin123"), "Admin", "", "", "", "Active"]);
      }
    } else {
      // Self-healing: Ensure headers match SHEETS_CONFIG
      const headers = SHEETS_CONFIG[name];
      const existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
      const isCorrect = headers.every((h, i) => h === existingHeaders[i]);
      if (!isCorrect) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
    }
  });
  return "System Initialized & Headers Verified";
}
