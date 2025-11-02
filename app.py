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
    page = request.args.get('page', 1, type=int) # Por defecto página 1
    per_page = request.args.get('per_page', 10, type=int) # Por defecto 10 vehículos por página
    search = request.args.get('search', '', type=str)
    
    # Calcular offset
    offset = (page - 1) * per_page # Usuario cambio de página, Para mostrar los siguientes vehiculos
    
    conn = pyodbc.connect(config.get_connection_string())
    
    try:
        # Query base con SELECT *
        base_query = "SELECT * FROM vehiculos"
        count_query = "SELECT COUNT(*) FROM vehiculos"
        
        # Agregar filtro de búsqueda si existe
        if search:
            where_clause = " WHERE marca LIKE ? OR modelo LIKE ? OR vin LIKE ?"
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
            cursor.execute(base_query + f" ORDER BY marca, modelo OFFSET {offset} ROWS FETCH NEXT {per_page} ROWS ONLY", (search_param, search_param, search_param))
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

# Endpoint para guardar un nuevo vehículo
@app.route('/api/nuevo_vehiculo', methods=['POST']) # POST: publicar datos
def nuevo_vehiculo():
    try:
        # Validar que se recibieron datos JSON
        if not request.json:
            return jsonify({"error": "No se recibieron datos JSON"}), 400
        
        nuevo_vehiculo = request.json
        
        # Validar solo campos esenciales como obligatorios
        campos_obligatorios = ["vin", "marca", "modelo", "anio_fabricacion", "precio"]
        for campo in campos_obligatorios:
            if not nuevo_vehiculo.get(campo):
                return jsonify({"error": f"El campo '{campo}' es obligatorio"}), 400
        
        conn = pyodbc.connect(config.get_connection_string())
        cursor = conn.cursor()
        
        # Verificar si ya existe un vehículo con ese VIN
        cursor.execute("SELECT COUNT(*) FROM vehiculos WHERE vin = ?", (nuevo_vehiculo.get("vin"),))
        if cursor.fetchone()[0] > 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "Ya existe un vehículo con ese VIN"}), 409
        
        # Insertar nuevo vehículo (con todos los campos posiblemente obligatorios)
        cursor.execute("""
            INSERT INTO vehiculos (
                vin, marca, modelo, anio_fabricacion, color, kilometraje, precio, condicion, 
                fecha_registro, numero_chasis, placa, tipo_vehiculo, cc_motor, tipo_combustible,
                transmision, numero_puertas, traccion, historial_accidentes, mantenimiento,
                garantia, disponibilidad_financiamiento, predio_o_vendedor, contacto, id_vendedor
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            config.limpiar(nuevo_vehiculo.get("vin")),
            config.limpiar(nuevo_vehiculo.get("marca")),
            config.limpiar(nuevo_vehiculo.get("modelo")),
            config.limpiar(nuevo_vehiculo.get("anio_fabricacion")),
            config.limpiar(nuevo_vehiculo.get("color", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("kilometraje", "0")),
            config.limpiar(nuevo_vehiculo.get("precio")),
            config.limpiar(nuevo_vehiculo.get("condicion", "Usado")),
            config.limpiar(nuevo_vehiculo.get("numero_chasis", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("placa", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("tipo_vehiculo", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("cc_motor", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("tipo_combustible", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("transmision", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("numero_puertas", "4")),
            config.limpiar(nuevo_vehiculo.get("traccion", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("historial_accidentes", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("mantenimiento", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("garantia", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("financiamiento", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("predio_vendedor", "No especificado")),
            config.limpiar(nuevo_vehiculo.get("contacto", "No especificado")),
            27  # ID de vendedor por defecto
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Vehículo guardado exitosamente", "vin": nuevo_vehiculo.get("vin")}), 201
        
    except pyodbc.Error as e:
        print(f"Error de base de datos en nuevo_vehiculo(): {e}")
        print(f"Detalles del error: {str(e)}")
        print(f"Datos recibidos: {nuevo_vehiculo}")
        return jsonify({"error": f"Error de base de datos: {str(e)}"}), 500
    except Exception as e:
        print(f"Error en nuevo_vehiculo(): {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/login', methods=['POST'])
def Login():
    try:
        # Validar que se recibieron datos JSON
        if not request.json:
            return jsonify({"error": "No se recibieron datos JSON"}), 400
        
        data = request.json
        email = data.get("email")
        password = data.get("password")

        # Aquí iría la lógica de autenticación
        conn = pyodbc.connect(config.get_connection_string())
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE email = ? AND password = ?", (email, password))
        if cursor.fetchone()[0] > 0:
            cursor.close()
            conn.close()
            return jsonify({"message": "Login exitoso"}), 200
        else:
            return jsonify({"error": "Credenciales inválidas"}), 401
    except Exception as e:
        print(f"Error en Login(): {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/crear_cuenta', methods=['POST'])
def Crear_Nueva_Cuenta():
    try:
        # Validar que se recibieron datos JSON (igual que login)
        if not request.json:
            return jsonify({"error": "No se recibieron datos JSON"}), 400
            
        data = request.json
        email = data.get("email")
        password = data.get("password")
        print(f"Crear cuenta - Email: {email}, Password: {password}")

        # Validar que se recibieron email y password
        if not email or not password:
            return jsonify({"error": "Email y contraseña son obligatorios"}), 400

        # Aquí iría la lógica para crear una nueva cuenta
        conn = pyodbc.connect(config.get_connection_string())
        cursor = conn.cursor()
        
        # Verificar si ya existe un usuario con ese EMAIL
        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE email = ?", (email,))
        if cursor.fetchone()[0] > 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "El email ya está en uso"}), 409

        # Crear la nueva cuenta
        cursor.execute("INSERT INTO usuarios (email, password) VALUES (?, ?)", (email, password))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Cuenta creada exitosamente"}), 201
    except pyodbc.Error as e:
        print(f"Error de base de datos en crear_cuenta(): {e}")
        return jsonify({"error": f"Error de base de datos: {str(e)}"}), 500
    except Exception as e:
        print(f"Error en crear_cuenta(): {e}")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)