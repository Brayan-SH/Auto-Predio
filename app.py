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
      return str(texto).strip().replace("  ", " ").replace("\t", "").replace("\n", "")

# Ruta para servir el HTML principal
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Ruta usuarios de la API
@app.route('/api/usuarios')
def usuarios():
    conn = pyodbc.connect(config.get_connection_string())
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuarios")
        usuarios_lista = []
        for row in cursor.fetchall():
          dpi, nombres, apellidos, correo_electronico, telefono, rol = row
          usuario = {
            "dpi": config.limpiar(dpi),
            "nombres": config.limpiar(nombres),
            "apellidos": config.limpiar(apellidos),
            "correo_electronico": config.limpiar(correo_electronico),
            "telefono": config.limpiar(telefono),
            "rol": config.limpiar(rol)
          }
        usuarios_lista.append(usuario)
        cursor.close()
        return jsonify(usuarios_lista)
    except Exception as e:
        print(f"Error en usuarios(): {e}")
        return jsonify({"error": "Error al obtener usuarios"}), 500
    finally:
        conn.close()

@app.route('/api/vehiculos')
def vehiculos():
    # Parámetros de paginación
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)  # 10 vehículos por página por defecto
    search = request.args.get('search', '', type=str)
    
    # Calcular offset
    offset = (page - 1) * per_page
    
    conn = pyodbc.connect(config.get_connection_string())
    
    try:
        # Query base
        base_query = "SELECT vin, marca, modelo, anio_fabricacion, color, kilometraje, precio, condicion FROM vehiculo"
        count_query = "SELECT COUNT(*) FROM vehiculo"
        
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
            vin, marca, modelo, anio_fabricacion, color, kilometraje, precio, condicion = row
            vehiculo = {
                "vin": config.limpiar(vin),
                "marca": config.limpiar(marca),
                "modelo": config.limpiar(modelo),
                "anio_fabricacion": config.limpiar(anio_fabricacion),
                "color": config.limpiar(color),
                "kilometraje": config.limpiar(kilometraje),
                "precio": config.limpiar(precio),
                "condicion": config.limpiar(condicion)
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

# Nuevo endpoint para detalles completos de un vehículo específico
@app.route('/api/vehiculos/<string:vin>')
def vehiculo_detalle(vin):
    conn = pyodbc.connect(config.get_connection_string())
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM vehiculo WHERE vin = ?", (vin,))
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            return jsonify({"error": "Vehículo no encontrado"}), 404
        
        vin, marca, modelo, anio_fabricacion, numero_chasis, placa, tipo_vehiculo, cc, tipo_combustible, transmision, color, kilometraje, numero_puertas, traccion, condicion, historial_accidentes, mantenimiento, garantia, precio, financiamiento, predio_vendedor, contacto, fotos, videos = row
        
        vehiculo = {
            "vin": config.limpiar(vin),
            "marca": config.limpiar(marca),
            "modelo": config.limpiar(modelo),
            "anio_fabricacion": config.limpiar(anio_fabricacion),
            "numero_chasis": config.limpiar(numero_chasis),
            "placa": config.limpiar(placa),
            "tipo_vehiculo": config.limpiar(tipo_vehiculo),
            "cc": config.limpiar(cc),
            "tipo_combustible": config.limpiar(tipo_combustible),
            "transmision": config.limpiar(transmision),
            "color": config.limpiar(color),
            "kilometraje": config.limpiar(kilometraje),
            "numero_puertas": config.limpiar(numero_puertas),
            "traccion": config.limpiar(traccion),
            "condicion": config.limpiar(condicion),
            "historial_accidentes": config.limpiar(historial_accidentes),
            "mantenimiento": config.limpiar(mantenimiento),
            "garantia": config.limpiar(garantia),
            "precio": config.limpiar(precio),
            "financiamiento": config.limpiar(financiamiento),
            "predio_vendedor": config.limpiar(predio_vendedor),
            "contacto": config.limpiar(contacto),
            "fotos": config.limpiar(fotos),
            "videos": config.limpiar(videos)
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
    # • http://127.0.0.1:5000/api/usuarios → endpoint para ver usuarios
    # • Ctrl+C → En la terminal donde está corriendo