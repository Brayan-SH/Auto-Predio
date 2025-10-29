import pyodbc

try:
    conn = pyodbc.connect('DRIVER={SQL Server};SERVER=localhost;DATABASE=Auto Predio;UID=sa;PWD=')
    cursor = conn.cursor()
    
    print("Orden de columnas en la tabla vehiculos:")
    cursor.execute("""
        SELECT COLUMN_NAME, ORDINAL_POSITION, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vehiculos' 
        ORDER BY ORDINAL_POSITION
    """)
    
    for row in cursor.fetchall():
        print(f"{row[1]:2d}: {row[0]:25s} ({row[2]})")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")