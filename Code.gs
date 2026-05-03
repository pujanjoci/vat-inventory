/**
 * Global Spreadsheet reference
 */
const SS = SpreadsheetApp.getActiveSpreadsheet();

/**
 * Configuration of sheets based on VAT N INVENTORY(SSA).xlsm
 */
const SHEETS_CONFIG = {
  "Users": ["Username", "Password", "Role", "CompanyName", "PAN_No", "ContactNo", "Status"],
  "RM_Master": ["Date", "RM Product Name", "RM Product Code", "Is it Taxable?", "Is it Directly Saleable?", "UOM", "Opening Balance (Qty)", "Opening Balance (Rs.)"],
  "FG_Master": ["Date", "FG Product Name", "FG Product Code", "Is it Taxable?", "UOM", "Opening Balance (Qty)", "Opening Balance (Rs.)"],
  "BP_Master": ["BPCode", "BPName", "Type", "ContactPerson", "Phone", "Email", "Address"],
  "Purchase_Book": ["Date", "Bill No", "Month", "Vendor Name", "Vendor PAN", "Product Name", "Qty", "Unit", "Rate", "Taxable Amt", "VAT Amt", "Total Amt", "Is Taxable?", "Is Capital Item?", "Remarks"],
  "Sales_Book": ["Date", "Bill No", "Month", "Customer Name", "Customer PAN", "Product Name", "Qty", "Unit", "Rate", "Taxable Amt", "VAT Amt", "Total Amt", "Is Taxable?", "Is Sales Return/ Credit Note?", "Remarks"],
  "GL_Master": ["GL Asset Name", "Sub Group", "Main Group", "Header", "Type", "Opening Debit", "Opening Credit", "FA Code"],
  "AR_AP": ["BPCode", "Name", "Type", "Balance", "Due Date", "Last Payment", "Status"],
  "Costing_Budget": ["Month", "Fiscal Year", "Output (Ltrs)", "Status", "Workers", "Wage/Worker", "Direct Wages", "OH-Power", "OH-Fuel", "OH-Maint", "OH-Other", "Total OH", "OH Rate/Ltr", "RM Cost (Auto)", "Total Cost", "Total Rate/Ltr"],
  "Settings": ["Key", "Value"]
};

/**
 * Initial static data from Excel
 */
const STATIC_DATA = {
  "RM_Master": [
    {"Date": "2025-07-16", "RM Product Name": "Rahar Dal ", "RM Product Code": "Rahar Dal ", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": 30.0, "Opening Balance (Rs.)": 8160.0},
    {"Date": "2025-07-16", "RM Product Name": "Masyang", "RM Product Code": "Masyang", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": 30.0, "Opening Balance (Rs.)": 4140.0},
    {"Date": "2025-07-16", "RM Product Name": "Chana", "RM Product Code": "Chana", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": 25.0, "Opening Balance (Rs.)": 3575.0},
    {"Date": "2025-07-16", "RM Product Name": "Mass Dal", "RM Product Code": "Mass Dal", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": 30.0, "Opening Balance (Rs.)": 4350.0},
    {"Date": "2025-07-16", "RM Product Name": "Rajma Daal", "RM Product Code": "Rajma Daal", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": 30.0, "Opening Balance (Rs.)": 3900.0},
    {"Date": "2025-07-16", "RM Product Name": "Fapar", "RM Product Code": "Fapar", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": 300.0, "Opening Balance (Rs.)": 27600.0},
    {"Date": "2025-07-16", "RM Product Name": "Green Moong", "RM Product Code": "Green Moong", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": 50.0, "Opening Balance (Rs.)": 7000.0},
    {"Date": "2025-07-16", "RM Product Name": "Mass Geda", "RM Product Code": "Mass Geda", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": 30.0, "Opening Balance (Rs.)": 5250.0},
    {"Date": "2025-07-16", "RM Product Name": "Kodo", "RM Product Code": "Kodo", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": 50.0, "Opening Balance (Rs.)": 3000.0},
    {"Date": "2025-07-16", "RM Product Name": "Tori Geda- OP", "RM Product Code": "Tori Geda- OP", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": 18393.14, "Opening Balance (Rs.)": 2078425.0},
    {"Date": "2025-07-16", "RM Product Name": "Repseed (tori)", "RM Product Code": "Repseed (tori)", "Is it Taxable?": "Yes", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": "", "Opening Balance (Rs.)": ""},
    {"Date": "2025-07-16", "RM Product Name": "Sesame seed", "RM Product Code": "Sesame seed", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": "", "Opening Balance (Rs.)": ""},
    {"Date": "2025-07-16", "RM Product Name": "Kismis", "RM Product Code": "Kismis", "Is it Taxable?": "No", "Is it Directly Saleable?": "Yes", "UOM": "KG", "Opening Balance (Qty)": "", "Opening Balance (Rs.)": ""}
  ],
  "FG_Master": [
    {"Date": "2025-07-16", "FG Product Name": "TORI KO TEL", "FG Product Code": "TORI KO TEL", "Is it Taxable?": "Yes", "UOM": "LTR", "Opening Balance (Qty)": 0, "Opening Balance (Rs.)": 0},
    {"Date": "2025-08-17", "FG Product Name": "FG-Rahar Dal", "FG Product Code": "FG-Rahar Dal", "Is it Taxable?": "No", "UOM": "KG", "Opening Balance (Qty)": 0, "Opening Balance (Rs.)": 0}
  ],
  "GL_Master": [
    {"GL Asset Name": "Factory Structure", "Sub Group": "Block A", "Main Group": "Depreciable Assets", "Header": "Non-Current Assets", "Type": "BS", "Opening Debit": 1000000.0, "Opening Credit": "", "FA Code": "FA-A-BLD"},
    {"GL Asset Name": "Plant And Machinery", "Sub Group": "Block D", "Main Group": "Depreciable Assets", "Header": "Non-Current Assets", "Type": "BS", "Opening Debit": 450000.0, "Opening Credit": "", "FA Code": "FA-D-PM"}
  ],
  "Settings": [
    {"Key": "Company Name", "Value": "Ganesh Tel Mill"},
    {"Key": "PAN No", "Value": "604141622"},
    {"Key": "Contact No", "Value": "9851135421"}
  ]
};

/**
 * Serves the HTML application OR returns JSON if action is provided
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    try {
      const action = e.parameter.action;
      let data;
      
      switch (action) {
        case 'getRMMaster': data = getMasterData('RM_Master'); break;
        case 'getFGMaster': data = getMasterData('FG_Master'); break;
        case 'getBPMaster': data = getMasterData('BP_Master'); break;
        case 'getPurchaseBook': data = getMasterData('Purchase_Book'); break;
        case 'getSalesBook': data = getMasterData('Sales_Book'); break;
        case 'getGLMaster': data = getMasterData('GL_Master'); break;
        case 'getCostingBudget': data = getMasterData('Costing_Budget'); break;
        case 'getDashboardStats': data = getDashboardStats(); break;
        case 'getUsers': data = getUsers(); break;
        case 'initSystem': data = initSheets(true); break; // Force reset and populate
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
 * Handle POST requests (API only)
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    const body = JSON.parse(e.postData.contents);
    let result;

    switch (action) {
      case 'loginUser': result = loginUser(body.username, body.password, body.role, body.companyName, body.panNo); break;
      case 'savePurchase': result = addMasterEntry('Purchase_Book', body); break;
      case 'saveSale': result = addMasterEntry('Sales_Book', body); break;
      case 'createUser': result = createUser(body); break;
      case 'updateUser': result = updateUser(body); break;
      case 'addMasterEntry': result = addMasterEntry(e.parameter.sheetName, body); break;
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
 * Auto-creates sheets and populates initial data
 */
function initSheets(forcePopulate = false) {
  Object.keys(SHEETS_CONFIG).forEach(name => {
    let sheet = SS.getSheetByName(name);
    if (!sheet) {
      sheet = SS.insertSheet(name);
      sheet.appendRow(SHEETS_CONFIG[name]);
      
      // Default Admin
      if (name === "Users") {
        sheet.appendRow(["admin", hashPassword("admin123"), "Admin", "", "", "", "Active"]);
        // Add sample company user from Excel settings
        sheet.appendRow(["TestUser", hashPassword("test123"), "Company", "IceLand", "54783678378", "98989898989", "Active"]);
      }

      // Populate static data if available
      if (STATIC_DATA[name]) {
        STATIC_DATA[name].forEach(rowObj => {
          const row = SHEETS_CONFIG[name].map(h => rowObj[h] || "");
          sheet.appendRow(row);
        });
      }
    } else if (forcePopulate && name !== "Users") {
      // Clear and repopulate for non-user sheets if forced
      sheet.clear();
      sheet.appendRow(SHEETS_CONFIG[name]);
      if (STATIC_DATA[name]) {
        STATIC_DATA[name].forEach(rowObj => {
          const row = SHEETS_CONFIG[name].map(h => rowObj[h] || "");
          sheet.appendRow(row);
        });
      }
    }
  });
  return "System Initialized Successfully";
}

/**
 * SHA-256 Hashing for Passwords
 */
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
 * Validates login against Users sheet
 */
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
    if (user.Status === "Deactivated") throw new Error("Account deactivated. Contact Admin.");
    delete user.Password;
    return user;
  }
  throw new Error("Invalid credentials or company details mismatch.");
}

/**
 * Admin Only: Create/Update users
 */
function createUser(userObj) {
  const existing = getSheetData("Users").find(u => u.Username === userObj.Username);
  if (existing) throw new Error("Username already exists.");
  const sheet = SS.getSheetByName("Users");
  const row = SHEETS_CONFIG["Users"].map(h => {
    if (h === "Password") return hashPassword(userObj[h] || "123456");
    if (h === "Status") return userObj[h] || "Active";
    return userObj[h] || "";
  });
  sheet.appendRow(row);
  return { success: true };
}

function getUsers() {
  return getSheetData("Users").map(u => {
    delete u.Password;
    return u;
  });
}

function updateUser(userObj) {
  const sheet = SS.getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIndex = data.findIndex(r => String(r[0]).trim().toLowerCase() === String(userObj.Username).trim().toLowerCase());
  if (userIndex === -1) throw new Error("User not found.");
  Object.keys(userObj).forEach(key => {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1 && key !== "Username") {
      let value = userObj[key];
      if (key === "Password" && value) value = hashPassword(value);
      sheet.getRange(userIndex + 1, colIndex + 1).setValue(value);
    }
  });
  return { success: true };
}

/**
 * Enhanced Data Entry with Calculations
 */
function addMasterEntry(sheetName, rowData) {
  const sheet = SS.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  
  // Apply Calculations for Purchase/Sales
  if (sheetName === 'Purchase_Book' || sheetName === 'Sales_Book') {
    const qty = parseFloat(rowData["Qty"]) || 0;
    const rate = parseFloat(rowData["Rate"]) || 0;
    const isTaxable = rowData["Is Taxable?"] === "Yes";
    
    rowData["Taxable Amt"] = qty * rate;
    rowData["VAT Amt"] = isTaxable ? rowData["Taxable Amt"] * 0.13 : 0;
    rowData["Total Amt"] = rowData["Taxable Amt"] + rowData["VAT Amt"];
    rowData["Date"] = rowData["Date"] || new Date().toISOString().split('T')[0];
  }

  const headers = SHEETS_CONFIG[sheetName];
  const row = headers.map(h => rowData[h] === undefined ? "" : rowData[h]);
  sheet.appendRow(row);

  // Update Inventory if it's a Purchase or Sale
  if (sheetName === 'Purchase_Book') updateStock(rowData["Product Name"], rowData["Qty"], 'add');
  if (sheetName === 'Sales_Book') updateStock(rowData["Product Name"], rowData["Qty"], 'remove');

  return { success: true };
}

/**
 * Stock Management Helper
 */
function updateStock(productName, qty, action) {
  const rmSheet = SS.getSheetByName("RM_Master");
  const fgSheet = SS.getSheetByName("FG_Master");
  
  const findAndUpdate = (sheet, nameCol, stockCol) => {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const nIdx = headers.indexOf(nameCol);
    const sIdx = headers.indexOf(stockCol);
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][nIdx]).trim() === String(productName).trim()) {
        const currentStock = parseFloat(data[i][sIdx]) || 0;
        const newStock = action === 'add' ? currentStock + parseFloat(qty) : currentStock - parseFloat(qty);
        sheet.getRange(i + 1, sIdx + 1).setValue(newStock);
        return true;
      }
    }
    return false;
  };

  if (!findAndUpdate(rmSheet, "RM Product Name", "Opening Balance (Qty)")) {
    findAndUpdate(fgSheet, "FGProduct Name", "Opening Balance (Qty)");
  }
}

/**
 * Dashboard & VAT Analytics
 */
function getDashboardStats() {
  const purchases = getSheetData("Purchase_Book");
  const sales = getSheetData("Sales_Book");
  
  const stats = {
    totalPurchases: purchases.reduce((sum, p) => sum + (parseFloat(p["Total Amt"]) || 0), 0),
    totalSales: sales.reduce((sum, s) => sum + (parseFloat(s["Total Amt"]) || 0), 0),
    inputVat: purchases.reduce((sum, p) => sum + (parseFloat(p["VAT Amt"]) || 0), 0),
    outputVat: sales.reduce((sum, s) => sum + (parseFloat(s["VAT Amt"]) || 0), 0),
    inventoryValue: getSheetData("RM_Master").reduce((sum, r) => sum + (parseFloat(r["Opening Balance (Rs.)"]) || 0), 0) +
                     getSheetData("FG_Master").reduce((sum, f) => sum + (parseFloat(f["Opening Balance (Rs.)"]) || 0), 0)
  };
  
  stats.vatPayable = stats.outputVat - stats.inputVat;
  return stats;
}

function getMasterData(sheetName) {
  return getSheetData(sheetName);
}

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

