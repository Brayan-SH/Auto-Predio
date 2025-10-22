from flask import Flask, jsonify, render_template_string, send_from_directory, request
from flask_cors import CORS
import pyodbc
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)  # Habilitar CORS para todas las rutas

class config:
    SERVER = os.getenv('DB_SERVER', 'localhost')
    DATABASE = os.getenv('DB_DATABASE', 'Auto Predio')
    USERNAME = os.getenv('DB_USERNAME', 'sa')
    PASSWORD = os.getenv('DB_PASSWORD', '')

    @staticmethod
    def get_connection_string():
        return f'DRIVER={{SQL Server}};SERVER={config.SERVER};DATABASE={config.DATABASE};UID={config.USERNAME};PWD={config.PASSWORD}'

    @staticmethod
    def limpiar(texto):
        if texto is None:
            return "No especificado"
        return str(texto).strip().replace("  ", " ").replace("\t", "").replace("\n", "")

# Ruta para servir el HTML principal
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/vehiculos')
def vehiculos():
    # Parámetros de paginación
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)
    
    # Calcular offset
    offset = (page - 1) * per_page
    
    conn = pyodbc.connect(config.get_connection_string())
    
    try:
        # Query base con SELECT *
        base_query = "SELECT * FROM vehiculos"
        count_query = "SELECT COUNT(*) FROM vehiculos"
        
        # Agregar filtro de búsqueda si existe
        if search:
            where_clause = " WHERE marca LIKE ? OR modelo LIKE ? OR color LIKE ?"
            search_param = f"%{search}%"
            base_query += where_clause
            count_query += where_clause
            
            # Primero contar total con filtro
            cursor_count = conn.cursor()
            cursor_count.execute(count_query, (search_param, search_param, search_param))
            total = cursor_count.fetchone()[0]
            cursor_count.close()
            
            # Ejecutar query con paginación y búsqueda
            cursor = conn.cursor()
            cursor.execute(base_query + f" ORDER BY marca, modelo OFFSET {offset} ROWS FETCH NEXT {per_page} ROWS ONLY", 
                          (search_param, search_param, search_param))
        else:
            # Primero contar total sin filtro
            cursor_count = conn.cursor()
            cursor_count.execute(count_query)
            total = cursor_count.fetchone()[0]
            cursor_count.close()
            
            # Sin filtro de búsqueda
            cursor = conn.cursor()
            cursor.execute(base_query + f" ORDER BY marca, modelo OFFSET {offset} ROWS FETCH NEXT {per_page} ROWS ONLY")
        
        vehiculos_lista = []
        for row in cursor.fetchall():
            # Estructura de vehiculos: id_vehiculo(0), vin(1), marca(2), modelo(3), anio_fabricacion(4), 
            # color(5), kilometraje(6), precio(7), condicion(8), fecha_registro(9), numero_chasis(10), 
            # placa(11), tipo_vehiculo(12), cc_motor(13), tipo_combustible(14), transmision(15), 
            # numero_puertas(16), traccion(17), historial_accidentes(18), mantenimiento(19), 
            # garantia(20), disponibilidad_financiamiento(21), predio_o_vendedor(22), contacto(23), id_vendedor(24)
            vehiculo = {
                "vin": config.limpiar(row[1]),
                "marca": config.limpiar(row[2]),
                "modelo": config.limpiar(row[3]),
                "anio_fabricacion": config.limpiar(row[4]),
                "color": config.limpiar(row[5]),
                "kilometraje": config.limpiar(row[6]),
                "precio": config.limpiar(row[7]),
                "condicion": config.limpiar(row[8])
            }
            vehiculos_lista.append(vehiculo)
        
        cursor.close()
        
        # Calcular información de paginación
        total_pages = (total + per_page - 1) // per_page
        
        return jsonify({
            "vehiculos": vehiculos_lista,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        })
        
    except Exception as e:
        print(f"Error en vehiculos(): {e}")
        return jsonify({"error": "Error al obtener vehículos"}), 500
    finally:
        conn.close()

# Endpoint para detalles completos de un vehículo específico
@app.route('/api/vehiculos/<string:vin>')
def vehiculo_detalle(vin):
    conn = pyodbc.connect(config.get_connection_string())
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM vehiculos WHERE vin = ?", (vin,))
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            return jsonify({"error": "Vehículo no encontrado"}), 404
        
        vehiculo = {
            "vin": config.limpiar(row[1]),
            "marca": config.limpiar(row[2]),
            "modelo": config.limpiar(row[3]),
            "anio_fabricacion": config.limpiar(row[4]),
            "numero_chasis": config.limpiar(row[10]),
            "placa": config.limpiar(row[11]),
            "tipo_vehiculo": config.limpiar(row[12]),
            "motor_cc": config.limpiar(row[13]),
            "tipo_combustible": config.limpiar(row[14]),
            "transmision": config.limpiar(row[15]),
            "color": config.limpiar(row[5]),
            "kilometraje": config.limpiar(row[6]),
            "numero_puertas": config.limpiar(row[16]),
            "traccion": config.limpiar(row[17]),
            "condicion": config.limpiar(row[8]),
            "historial_accidentes": config.limpiar(row[18]),
            "mantenimiento": config.limpiar(row[19]),
            "garantia": config.limpiar(row[20]),
            "precio": config.limpiar(row[7]),
            "financiamiento": config.limpiar(row[21]),
            "predio_vendedor": config.limpiar(row[22]),
            "contacto": config.limpiar(row[23])
        }
        cursor.close()
        return jsonify(vehiculo)
    except Exception as e:
        print(f"Error en vehiculo_detalle(): {e}")
        return jsonify({"error": "Error al obtener detalles del vehículo"}), 500
    finally:
        conn.close()

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)