import pandas as pd
import json

file_path = 'VAT N INVENTORY(SSA).xlsm'

def format_val(val):
    if pd.isna(val): return ""
    if hasattr(val, 'isoformat'): return val.isoformat()[:10]
    return val

try:
    xl = pd.ExcelFile(file_path)
    
    # We'll focus on RM_Master and FG_Master for now as they have the most static data
    sheets_to_import = ['RM_Master', 'FG_Master', 'GL_Master', 'Settings']
    
    js_output = "const STATIC_DATA = {\n"
    
    for sheet_name in sheets_to_import:
        if sheet_name in xl.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            df.columns = [str(c).strip() for c in df.columns]
            
            rows = []
            for _, row in df.iterrows():
                row_dict = {str(k): format_val(v) for k, v in row.items()}
                # Skip empty rows
                if any(row_dict.values()):
                    rows.append(row_dict)
            
            js_output += f'  "{sheet_name}": {json.dumps(rows, indent=4)},\n'
    
    js_output += "};"
    
    with open('scratch/static_data.js', 'w') as f:
        f.write(js_output)
    print("Static data JS generated in scratch/static_data.js")

except Exception as e:
    print("Error:", e)
