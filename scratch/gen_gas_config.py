import pandas as pd
import json

file_path = 'VAT N INVENTORY(SSA).xlsm'

def clean_val(val):
    if pd.isna(val): return ""
    return val

try:
    xl = pd.ExcelFile(file_path)
    
    config = {}
    initial_data = {}
    
    # Mapping Excel sheet names to our internal sheet names
    sheet_map = {
        'RM_Master': 'RM_Master',
        'FG_Master': 'FG_Master',
        'BP_Master': 'BP_Master',
        'Purchase_Book': 'PurchaseBook',
        'Sales_Book': 'SalesBook',
        'GL_Master': 'GL_Master',
        'AR_AP': 'AR_AP',
        'Costing_Budget': 'CostingBudget',
        'Settings': 'Settings'
    }
    
    for ex_sheet, gs_sheet in sheet_map.items():
        if ex_sheet in xl.sheet_names:
            df = pd.read_excel(file_path, sheet_name=ex_sheet)
            df.columns = [str(c).strip() for c in df.columns]
            headers = df.columns.tolist()
            config[gs_sheet] = headers
            
            # Take top 10 rows as sample
            sample = df.head(10).where(pd.notnull(df), "").to_dict(orient='records')
            # Convert any timestamps in data
            for row in sample:
                for k, v in row.items():
                    if hasattr(v, 'isoformat'):
                        row[k] = v.isoformat()[:10]
            initial_data[gs_sheet] = sample

    print("--- SHEETS_CONFIG ---")
    print(json.dumps(config, indent=2))
    print("\n--- SAMPLE_DATA ---")
    print(json.dumps(initial_data, indent=2))

except Exception as e:
    print("Error:", e)
