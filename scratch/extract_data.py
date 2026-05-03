import pandas as pd
import json

file_path = 'VAT N INVENTORY(SSA).xlsm'
output_path = 'scratch/excel_data.json'

try:
    xl = pd.ExcelFile(file_path)
    all_data = {}
    
    for sheet_name in xl.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        # Ensure column names are strings
        df.columns = [str(c) for c in df.columns]
        # Convert NaN to None for JSON
        df = df.where(pd.notnull(df), None)
        # Convert date columns to string
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                df[col] = df[col].dt.strftime('%Y-%m-%d')
        
        all_data[sheet_name] = df.to_dict(orient='records')
    
    with open(output_path, 'w') as f:
        json.dump(all_data, f, indent=2)
    print("Data extracted successfully to", output_path)
except Exception as e:
    print("Error:", e)
