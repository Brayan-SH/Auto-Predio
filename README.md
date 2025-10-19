# 🚘 Auto Predio

Sistema de gestión de vehículos con Flask y SQL Server.

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

## 📁 Estructura

```
Auto-Predio/
├── app.py              # Aplicación Flask
├── index.html          # Frontend
├── .env               # Credenciales (NO subir)
├── .env.example       # Plantilla de configuración
├── .gitignore         # Archivos ignorados
└── README.md          # Este archivo
```