from flask import Flask, jsonify, render_template_string, send_from_directory, request
from flask_cors import CORS
import pyodbc
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__, static_folder='.')
# Configurar CORS para permitir todos los orígenes durante desarrollo
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

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
def Vehiculos():
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
                "condicion": config.limpiar(row[8]),
                "vendido": bool(row[-1]) if row[-1] is not None else False  # Estado de venta
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
def Vehiculo_Detalle(vin):
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
@app.route('/api/nuevo-vehiculo', methods=['POST']) # POST: publicar datos
def Nuevo_Vehiculo():
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
        
        # Obtener el ID del vendedor basado en el usuario logueado
        id_usuario = nuevo_vehiculo.get("id_usuario")
        if not id_usuario:
            return jsonify({"error": "ID de usuario es obligatorio"}), 400
        
        # Buscar el ID del vendedor para este usuario
        cursor.execute("SELECT id_vendedor FROM vendedores WHERE id_usuario = ?", (id_usuario,))
        vendedor_row = cursor.fetchone()
        if not vendedor_row:
            cursor.close()
            conn.close()
            return jsonify({"error": "No se encontró un vendedor asociado a este usuario"}), 404
        
        id_vendedor = vendedor_row[0]
        
        # Insertar nuevo vehículo (con todos los campos posiblemente obligatorios)
        cursor.execute("""
            INSERT INTO vehiculos (
                vin, marca, modelo, anio_fabricacion, color, kilometraje, precio, condicion, 
                numero_chasis, placa, tipo_vehiculo, cc_motor, tipo_combustible,
                transmision, numero_puertas, traccion, historial_accidentes, mantenimiento,
                garantia, disponibilidad_financiamiento, predio_o_vendedor, contacto, vistas, estado_vendido, id_vendedor
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            0,    # vistas - valor por defecto
            'disponible',  # estado_vendido - por defecto disponible
            id_vendedor   # ID de vendedor - al final
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
        
        # Obtener datos de login
        data = request.json
        email = data.get("email")
        password = data.get("password")

        # Autenticar y obtener id_usuario
        conn = pyodbc.connect(config.get_connection_string())
        cursor = conn.cursor()
        cursor.execute("SELECT id_usuario FROM usuarios WHERE email = ? AND password = ?", (email, password))
        result = cursor.fetchone()
        
        if result:
            id_usuario = result[0]
            cursor.close()
            conn.close()
            return jsonify({"message": "Login exitoso", "id_usuario": id_usuario}), 200
        else:
            cursor.close()
            conn.close()
            return jsonify({"error": "Credenciales inválidas"}), 401
    except Exception as e:
        print(f"Error en Login(): {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/crear_cuenta', methods=['POST'])
def Crear_Nueva_Cuenta():
    try:
        # Validar que se recibieron datos JSON
        if not request.json:
            return jsonify({"error": "No se recibieron datos JSON"}), 400
            
        data = request.json
        
        # Extraer datos básicos
        email = data.get("email")
        password = data.get("password")
        nombre_completo = data.get("nombre_completo")
        telefono = data.get("telefono")
        direccion = data.get("direccion")
        dpi = data.get("dpi")
        
        # Extraer datos opcionales para vendedor
        nombre_comercial = data.get("nombre_comercial", nombre_completo)
        tipo_vendedor = data.get("tipo_vendedor", "Persona Individual")
        preferencias = data.get("preferencias", "Sin preferencias específicas")
        
        print(f"Crear cuenta completa - Email: {email}, Nombre: {nombre_completo}")

        # Validar campos obligatorios
        if not all([email, password, nombre_completo, telefono, direccion, dpi]):
            return jsonify({"error": "Todos los campos básicos son obligatorios"}), 400

        conn = pyodbc.connect(config.get_connection_string())
        cursor = conn.cursor()
        
        # Verificar si ya existe un usuario con ese EMAIL
        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE email = ?", (email,))
        if cursor.fetchone()[0] > 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "El email ya está en uso"}), 409

        # 1. Crear el usuario en la tabla usuarios
        cursor.execute("INSERT INTO usuarios (email, password) VALUES (?, ?)", (email, password))
        
        # Obtener el ID del usuario recién creado
        cursor.execute("SELECT @@IDENTITY")
        id_usuario = cursor.fetchone()[0]
        print(f"Usuario creado con ID: {id_usuario}")
        
        # 2. Crear registro en la tabla clientes
        cursor.execute("""
            INSERT INTO clientes (nombre_completo, dpi, correo_electronico, telefono, direccion, fecha_registro, preferencias, id_usuario)
            VALUES (?, ?, ?, ?, ?, GETDATE(), ?, ?)
        """, (nombre_completo, dpi, email, telefono, direccion, preferencias, id_usuario))
        
        # 3. Crear registro en la tabla vendedores
        cursor.execute("""
            INSERT INTO vendedores (nombre_comercial, representante, correo_electronico, telefono, direccion, tipo_vendedor, fecha_registro, id_usuario)
            VALUES (?, ?, ?, ?, ?, ?, GETDATE(), ?)
        """, (nombre_comercial, nombre_completo, email, telefono, direccion, tipo_vendedor, id_usuario))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "message": "Cuenta creada exitosamente",
            "id_usuario": id_usuario,
            "detalles": "Usuario registrado como cliente y vendedor"
        }), 201
    except pyodbc.Error as e:
        print(f"Error de base de datos en crear_cuenta(): {e}")
        return jsonify({"error": f"Error de base de datos: {str(e)}"}), 500
    except Exception as e:
        print(f"Error en crear_cuenta(): {e}")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@app.route('/api/mostrar-vehiculo/<string:vin>', methods=['GET'])
def Cargar_Vehiculo(vin):
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
            "cc_motor": config.limpiar(row[13]),
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
            
    except pyodbc.Error as e:
        print(f"Error de base de datos en mostrar_vehiculo(): {e}")
        return jsonify({"error": f"Error de base de datos: {str(e)}"}), 500
    except Exception as e:
        print(f"Error en mostrar_vehiculo(): {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
    finally:
        conn.close()

@app.route('/api/eliminar-vehiculo/<string:vin>', methods=['DELETE'])
def Eliminar_Vehiculo(vin):
    
    conn = pyodbc.connect(config.get_connection_string())
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM vehiculos WHERE vin = ?", (vin,))
        conn.commit()
        cursor.close()
        return jsonify({"message": "Vehículo eliminado exitosamente"}), 200
    except pyodbc.Error as e:
        print(f"Error de base de datos en eliminar_vehiculo(): {e}")
        return jsonify({"error": f"Error de base de datos: {str(e)}"}), 500
    except Exception as e:
        print(f"Error en eliminar_vehiculo(): {e}")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

@app.route('/api/actualizar-vehiculo/<string:vin>', methods=['PUT'])
def Actualizar_Vehiculo(vin):
    # Actualizar el vehiculo
    try:
        # Validar que se recibieron datos JSON
        if not request.json:
            return jsonify({"error": "No se recibieron datos JSON"}), 400
        
        vehiculo_actualizado = request.json
        
        conn = pyodbc.connect(config.get_connection_string())
        cursor = conn.cursor()
        
        # Verificar que el vehículo existe
        cursor.execute("SELECT COUNT(*) FROM vehiculos WHERE vin = ?", (vin,))
        if cursor.fetchone()[0] == 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "Vehículo no encontrado"}), 404
        
        # Actualizar vehículo
        cursor.execute(""" 
                UPDATE vehiculos SET
                color = ?, 
                kilometraje = ?, 
                precio = ?, 
                condicion = ?,
                placa = ?,
                transmision = ?,
                historial_accidentes = ?, 
                mantenimiento = ?,
                garantia = ?, 
                disponibilidad_financiamiento = ?, 
                predio_o_vendedor = ?, 
                contacto = ? 
                WHERE vin = ?""", (
            config.limpiar(vehiculo_actualizado.get("color", "No especificado")),
            config.limpiar(vehiculo_actualizado.get("kilometraje", "0")),
            config.limpiar(vehiculo_actualizado.get("precio", "0")),
            config.limpiar(vehiculo_actualizado.get("condicion", "Usado")),
            config.limpiar(vehiculo_actualizado.get("placa", "No especificado")),
            config.limpiar(vehiculo_actualizado.get("transmision", "No especificado")),
            config.limpiar(vehiculo_actualizado.get("historial_accidentes", "No especificado")),
            config.limpiar(vehiculo_actualizado.get("mantenimiento", "No especificado")),
            config.limpiar(vehiculo_actualizado.get("garantia", "No especificado")),
            config.limpiar(vehiculo_actualizado.get("disponibilidad_financiamiento", "No especificado")),
            config.limpiar(vehiculo_actualizado.get("predio_vendedor", "No especificado")),
            config.limpiar(vehiculo_actualizado.get("contacto", "No especificado")),
            vin
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Vehículo actualizado exitosamente"}), 200
        
    except pyodbc.Error as e:
        print(f"Error de base de datos en actualizar_vehiculo(): {e}")
        return jsonify({"error": f"Error de base de datos: {str(e)}"}), 500
    except Exception as e:
        print(f"Error en actualizar_vehiculo(): {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/vehiculos-usuario/<int:id_usuario>')
def Vehiculos_Por_Vendedor(id_usuario):
    print(f"Obteniendo vehículos para el usuario ID: {id_usuario}")
    
    """Obtener vehículos del usuario específico con paginación"""
    # Parámetros de paginación
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 6, type=int)
    search = request.args.get('search', '', type=str)
    
    # Calcular offset
    offset = (page - 1) * per_page
    
    try:
        conn = pyodbc.connect(config.get_connection_string())
        cursor = conn.cursor()
        
        # Buscar vehículos por id_vendedor usando la relación vendedores -> usuarios
        base_query = """SELECT v.id_vehiculo, v.vin, v.marca, v.modelo, v.anio_fabricacion, v.color, 
                               v.kilometraje, v.precio, v.condicion, v.numero_chasis, v.placa, 
                               v.tipo_vehiculo, v.cc_motor, v.tipo_combustible, v.transmision, 
                               v.numero_puertas, v.traccion, v.historial_accidentes, v.mantenimiento, 
                               v.garantia, v.disponibilidad_financiamiento, v.predio_o_vendedor, v.contacto, 
                               v.fecha_registro, v.vistas, v.estado_vendido
                        FROM vehiculos v
                        INNER JOIN vendedores vend ON v.id_vendedor = vend.id_vendedor
                        WHERE vend.id_usuario = ?"""
        count_query = """SELECT COUNT(*) FROM vehiculos v
                        INNER JOIN vendedores vend ON v.id_vendedor = vend.id_vendedor
                        WHERE vend.id_usuario = ?"""
        
        base_params = (id_usuario,)
        
        print(f"Buscando vehículos para id_usuario: {id_usuario}")
        
        # Agregar filtro de búsqueda si existe
        if search:
            where_extension = " AND (v.marca LIKE ? OR v.modelo LIKE ? OR v.vin LIKE ?)"
            search_param = f"%{search}%"
            base_query += where_extension
            count_query += where_extension
            params = base_params + (search_param, search_param, search_param)
        else:
            params = base_params
        
        # Contar total
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]
        print(f"Total de vehículos encontrados: {total}")
        
        # Ejecutar query con paginación
        final_query = base_query + f" ORDER BY fecha_registro DESC OFFSET {offset} ROWS FETCH NEXT {per_page} ROWS ONLY"
        cursor.execute(final_query, params)
        
        vehiculos_lista = []
        rows = cursor.fetchall()
        print(f"Filas obtenidas después de paginación: {len(rows)}")
        
        for row in rows:
            # estado_vendido está en posición 25 (última columna)
            estado_vendido_value = row[25] if len(row) > 25 and row[25] is not None else None
            
            # Determinar si está vendido basado en el campo estado_vendido (quitar espacios)
            estado_limpio = str(estado_vendido_value).strip().lower() if estado_vendido_value else 'disponible'
            vendido = estado_limpio == 'vendido'
            
            print(f"VIN: {row[1]}, estado_vendido en DB: '{estado_vendido_value}', limpio: '{estado_limpio}', vendido: {vendido}")
            
            vehiculo = {
                "vin": config.limpiar(row[1]),
                "marca": config.limpiar(row[2]),
                "modelo": config.limpiar(row[3]),
                "anio_fabricacion": config.limpiar(row[4]),
                "color": config.limpiar(row[5]),
                "kilometraje": config.limpiar(row[6]),
                "precio": config.limpiar(row[7]),
                "condicion": config.limpiar(row[8]),
                "predio_vendedor": config.limpiar(row[22]) if len(row) > 22 else "No especificado",
                "contacto": config.limpiar(row[23]) if len(row) > 23 else "No especificado",
                "vendido": vendido
            }
            vehiculos_lista.append(vehiculo)
        
        cursor.close()
        conn.close()
        
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
            },
            "usuario_id": id_usuario
        })
        
    except Exception as e:
        print(f"Error en vehiculos_por_usuario(): {e}")
        return jsonify({"error": "Error al obtener vehículos del usuario"}), 500

@app.route('/api/marcar-vendido/<string:vin>', methods=['PUT'])
def Marcar_Vendido(vin):
    """Marcar un vehículo como vendido o disponible"""
    print(f"=== MARCAR VENDIDO ===")
    print(f"VIN recibido: {vin}")
    print(f"Datos JSON recibidos: {request.json}")
    
    try:
        if not request.json:
            print("Error: No se recibieron datos JSON")
            return jsonify({"error": "No se recibieron datos JSON"}), 400
        
        vendido = request.json.get("vendido")
        print(f"Valor vendido extraído: {vendido} (tipo: {type(vendido)})")
        
        if vendido is None:
            print("Error: Campo vendido es None")
            return jsonify({"error": "El campo 'vendido' es obligatorio"}), 400
        
        conn = pyodbc.connect(config.get_connection_string())
        cursor = conn.cursor()
        
        # Verificar que el vehículo existe
        cursor.execute("SELECT COUNT(*) FROM vehiculos WHERE vin = ?", (vin,))
        if cursor.fetchone()[0] == 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "Vehículo no encontrado"}), 404
        
        # Actualizar estado del vehículo en la columna estado_vendido
        estado_valor = 'vendido' if vendido else 'disponible'
        print(f"Actualizando VIN {vin} a estado: '{estado_valor}'")
        
        # Verificar estado actual antes del update
        cursor.execute("SELECT estado_vendido FROM vehiculos WHERE vin = ?", (vin,))
        estado_actual = cursor.fetchone()
        print(f"Estado actual en BD: '{estado_actual[0] if estado_actual else 'N/A'}'")
        
        cursor.execute("UPDATE vehiculos SET estado_vendido = ? WHERE vin = ?", (estado_valor, vin))
        rows_affected = cursor.rowcount
        print(f"Filas afectadas: {rows_affected}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        estado_texto = "vendido" if vendido else "disponible"
        print(f"Respuesta exitosa: Vehículo marcado como {estado_texto}")
        return jsonify({"message": f"Vehículo marcado como {estado_texto} exitosamente"}), 200
        
    except Exception as e:
        print(f"Error en marcar_vendido(): {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)