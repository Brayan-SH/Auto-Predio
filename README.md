# � Auto Predio - Sistema de Gestión de Vehículos

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11+-green.svg)
![Flask](https://img.shields.io/badge/Flask-2.3+-red.svg)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-orange.svg)

## 📋 Descripción

Auto Predio es una plataforma web completa para la gestión, compra y venta de vehículos. Permite a usuarios registrarse tanto como clientes (compradores) como vendedores, facilitando un marketplace integral de automóviles.

## ✨ Características Principales

### 👥 Gestión de Usuarios
- **Registro dual**: Los usuarios se registran automáticamente como clientes Y vendedores
- **Autenticación segura**: Sistema de login con validación
- **Perfiles completos**: Información personal y comercial

### 🚘 Gestión de Vehículos
- **Catálogo completo**: Visualización de todos los vehículos disponibles
- **Mi Catálogo**: Gestión personal de vehículos por vendedor
- **Estados dinámicos**: Disponible/Vendido con actualización en tiempo real
- **Búsqueda avanzada**: Por marca, modelo, VIN
- **Detalles completos**: Especificaciones técnicas, precios, contacto

### 🔧 Funcionalidades Avanzadas
- **CRUD completo**: Crear, leer, actualizar, eliminar vehículos
- **Paginación**: Navegación eficiente por grandes catálogos
- **Responsive Design**: Compatible con dispositivos móviles
- **Modales informativos**: Detalles expandidos de vehículos

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend      │    │   Base de Datos │
│                 │    │                  │    │                 │
│  • HTML5        │◄──►│  • Flask (Python)│◄──►│  • SQL Server   │
│  • CSS3         │    │  • RESTful API   │    │  • pyodbc       │
│  • JavaScript   │    │  • CORS enabled  │    │  • Relacional   │
│  • Bootstrap 5  │    │  • JSON responses│    │  • Transaccional│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Brayan-SH/Auto-Predio.git
cd Auto-Predio
```

### 2. Crear entorno virtual
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

### 3. Instalar dependencias
```bash
pip install flask flask-cors pyodbc python-dotenv
```

### 4. Configurar base de datos
1. Copia `.env.example` a `.env`
2. Edita `.env` con tus credenciales:
```
DB_SERVER=tu_servidor
DB_DATABASE=tu_base_datos  
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

### 5. Ejecutar aplicación
```bash
python app.py
```

Visita: http://localhost:5000

## 🔐 Seguridad

- ⚠️ **NUNCA** subas el archivo `.env` al repositorio
- ✅ Usa `.env.example` como plantilla
- 🔒 Las credenciales están protegidas

## 📁 Estructura del Proyecto

```
Auto-Predio/
├── app.py              # Aplicación Flask principal
├── index.html          # Frontend principal
├── app.js             # JavaScript del frontend
├── SQLQuery5.sql      # Scripts de base de datos
├── DB/
│   └── consultas.sql  # Consultas adicionales
├── .env               # Credenciales (NO subir)
├── .env.example       # Plantilla de configuración
├── .gitignore         # Archivos ignorados
└── README.md          # Documentación
```

## 🗃️ Esquema de Base de Datos

### Diagrama de Relaciones
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   USUARIOS  │────►│ VENDEDORES  │────►│  VEHICULOS  │
│             │     │             │     │             │
│ • id        │     │ • id        │     │ • id        │
│ • nombre    │     │ • user_id   │     │ • vendedor_id│
│ • email     │     │ • telefono  │     │ • marca     │
│ • password  │     │ • direccion │     │ • modelo    │
└─────────────┘     └─────────────┘     │ • precio    │
        │                               │ • estado    │
        │           ┌─────────────┐     └─────────────┘
        └──────────►│  CLIENTES   │
                    │             │
                    │ • id        │
                    │ • user_id   │
                    │ • tipo_doc  │
                    │ • documento │
                    └─────────────┘
```

### Tablas Principales

#### 🔹 USUARIOS
```sql
id: int (PK, IDENTITY)
nombre: nvarchar(100)
apellido: nvarchar(100)
email: nvarchar(100) UNIQUE
password: nvarchar(255)
fecha_registro: datetime DEFAULT GETDATE()
```

#### 🔹 VENDEDORES
```sql
id: int (PK, IDENTITY)
user_id: int (FK → usuarios.id)
telefono: nvarchar(20)
direccion: nvarchar(200)
ciudad: nvarchar(100)
codigo_postal: nvarchar(10)
```

#### 🔹 CLIENTES
```sql
id: int (PK, IDENTITY)
user_id: int (FK → usuarios.id)
tipo_documento: nvarchar(20)
numero_documento: nvarchar(50)
fecha_nacimiento: date
telefono: nvarchar(20)
```

#### 🔹 VEHICULOS (27 columnas)
```sql
id: int (PK, IDENTITY)
vendedor_id: int (FK → vendedores.id)
marca: nvarchar(50)
modelo: nvarchar(50)
año: int
precio: decimal(18,2)
kilometraje: int
transmision: nvarchar(20)
combustible: nvarchar(20)
color: nvarchar(30)
vin: nvarchar(17) UNIQUE
estado_vendido: nchar(50) -- 'Disponible' | 'Vendido'
descripcion: ntext
imagen_url: nvarchar(500)
# ... y 14 campos adicionales
```

## 🌐 API Endpoints

### 🔐 Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/login` | Autenticar usuario |
| `POST` | `/crear_cuenta` | Registrar nuevo usuario |

**Ejemplo - Login:**
```javascript
POST /login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "contraseña123"
}

// Respuesta exitosa
{
  "success": true,
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "email": "usuario@email.com"
  }
}
```

**Ejemplo - Crear Cuenta:**
```javascript
POST /crear_cuenta
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "password": "contraseña123",
  "telefono": "1234567890",
  "direccion": "Calle 123",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "tipo_documento": "CC",
  "numero_documento": "12345678",
  "fecha_nacimiento": "1990-01-01"
}
```

### 🚗 Gestión de Vehículos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/catalogo` | Obtener todos los vehículos |
| `GET` | `/mi_catalogo/<vendedor_id>` | Vehículos de un vendedor |
| `POST` | `/crear_vehiculo` | Crear nuevo vehículo |
| `PUT` | `/actualizar_estado_vehiculo` | Cambiar estado (Disponible/Vendido) |
| `DELETE` | `/eliminar_vehiculo/<id>` | Eliminar vehículo |

**Ejemplo - Crear Vehículo:**
```javascript
POST /crear_vehiculo
Content-Type: application/json

{
  "vendedor_id": 1,
  "marca": "Toyota",
  "modelo": "Corolla",
  "año": 2020,
  "precio": 45000000,
  "kilometraje": 25000,
  "transmision": "Automática",
  "combustible": "Gasolina",
  "color": "Blanco",
  "vin": "1HGBH41JXMN109186",
  "descripcion": "Vehículo en excelente estado",
  // ... otros campos
}
```

## 💻 Uso del Sistema

### 1. Registro de Usuario
```javascript
// Frontend automáticamente:
// ✅ Crea registro en tabla 'usuarios'
// ✅ Crea registro en tabla 'vendedores' 
// ✅ Crea registro en tabla 'clientes'
// ✅ Vincula todas las tablas por user_id
```

### 2. Gestión de Vehículos
```javascript
// Mi Catálogo (vendedor)
function verMiCatalogo() {
    const vendedorId = localStorage.getItem('vendedor_id');
    fetch(`/mi_catalogo/${vendedorId}`)
        .then(response => response.json())
        .then(vehiculos => {
            // Mostrar solo vehículos del vendedor actual
        });
}

// Cambiar estado
function cambiarEstado(vehiculoId, nuevoEstado) {
    fetch('/actualizar_estado_vehiculo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            vehiculo_id: vehiculoId,
            estado: nuevoEstado
        })
    });
}
```

### 3. Autenticación
```javascript
// Login persistente
localStorage.setItem('usuario_id', usuario.id);
localStorage.setItem('vendedor_id', vendedor.id);
localStorage.setItem('cliente_id', cliente.id);

// Verificar sesión
function verificarSesion() {
    return localStorage.getItem('usuario_id') !== null;
}
```

## 🚀 Características Técnicas

### Backend (Flask)
- **pyodbc**: Conexión nativa con SQL Server
- **CORS**: Habilitado para desarrollo frontend
- **JSON APIs**: Respuestas estructuradas
- **Manejo de errores**: Try-catch con mensajes descriptivos
- **Transacciones**: Operaciones atómicas en base de datos

### Frontend (JavaScript/Bootstrap)
- **SPA (Single Page App)**: Navegación sin recargas
- **LocalStorage**: Persistencia de sesión
- **Bootstrap 5**: UI responsiva y moderna
- **Modales**: Interfaces emergentes para detalles
- **Validación**: Formularios con verificación client-side

### Base de Datos (SQL Server)
- **Integridad referencial**: Foreign keys estrictas
- **Índices**: Optimización en campos de búsqueda
- **Tipos de datos**: nchar, nvarchar, decimal, datetime
- **Constraints**: UNIQUE en email y VIN

## 🔍 Resolución de Problemas

### Error: "Estado no se actualiza"
```sql
-- ✅ Columna correcta
UPDATE vehiculos SET estado_vendido = 'Vendido' WHERE id = ?

-- ❌ Columna incorrecta  
UPDATE vehiculos SET vistas = 'Vendido' WHERE id = ?
```

### Error: "Parámetros insuficientes"
```python
# ✅ Verificar que coincidan parámetros con columnas
cursor.execute(query, (param1, param2, ..., param27))  # 27 parámetros
```

### Error: "Usuario no puede crear vehículos"
```javascript
// ✅ Verificar que existe vendedor_id
const vendedorId = localStorage.getItem('vendedor_id');
if (!vendedorId) {
    alert('Error: No tienes perfil de vendedor');
    return;
}
```

## 🛠️ Desarrollo

### Configuración para Desarrollo
```bash
# Modo debug
set FLASK_ENV=development
set FLASK_DEBUG=1
python app.py
```

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato de código
refactor: refactorización
test: pruebas
```

## 🔮 Roadmap y Mejoras Futuras

### Próximas Funcionalidades
- [ ] **Sistema de favoritos** para clientes
- [ ] **Chat en tiempo real** entre compradores y vendedores
- [ ] **Subida múltiple de imágenes** por vehículo
- [ ] **Sistema de calificaciones** y reseñas
- [ ] **Notificaciones push** para nuevos vehículos
- [ ] **Filtros avanzados** (rango de precios, año, etc.)
- [ ] **Comparador de vehículos** lado a lado
- [ ] **Reportes y analytics** para vendedores

### Mejoras Técnicas
- [ ] **Autenticación JWT** para mayor seguridad
- [ ] **Cache con Redis** para mejor rendimiento  
- [ ] **API versioning** (/api/v1/, /api/v2/)
- [ ] **Testing automatizado** (Unit tests, Integration tests)
- [ ] **CI/CD pipeline** con GitHub Actions
- [ ] **Containerización** con Docker
- [ ] **Rate limiting** para APIs
- [ ] **Logging estructurado** con ELK Stack

### Optimizaciones
- [ ] **Paginación server-side** para catálogos grandes
- [ ] **Lazy loading** de imágenes
- [ ] **Búsqueda full-text** con índices especializados
- [ ] **CDN** para imágenes de vehículos
- [ ] **Compresión de imágenes** automática
- [ ] **PWA (Progressive Web App)** capabilities

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👨‍💻 Autor

**Brayan SH** - [GitHub](https://github.com/Brayan-SH)

## 🙏 Agradecimientos

- Bootstrap team por el framework CSS
- Flask community por la documentación
- Microsoft por SQL Server
- Todos los contribuidores del proyecto

---
⭐ **¡Dale una estrella si te gustó el proyecto!** ⭐