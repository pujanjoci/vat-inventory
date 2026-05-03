import pandas as pd
import openpyxl

file_path = 'VAT N INVENTORY(SSA).xlsm'

try:
    xl = pd.ExcelFile(file_path)
    print("Sheet Names:", xl.sheet_names)
    
    for sheet_name in xl.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=5)
        print(f"\n--- {sheet_name} ---")
        print("Columns:", df.columns.tolist())
        print("Sample Data:\n", df.head(3))
except Exception as e:
    print("Error:", e)
