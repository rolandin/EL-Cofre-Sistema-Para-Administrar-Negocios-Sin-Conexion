# El Cofre - Sistema de Gestión de Negocios Offline

## 🌟 Descripción

El Cofre es una solución de software agnóstica diseñada para pequeñas y medianas empresas que buscan operar bajo condiciones adversas en zonas geográficas en donde escasea la conexión a internet y/o el fluido eléctrico. Este sistema es completamente agnóstico en términos políticos y monetarios, el usuario tiene control total sobre sus datos.

La base de datos está alojada localmente, lo que garantiza que los usuarios tengan control absoluto sobre sus datos. El sistema permite realizar copias de seguridad físicas (por ejemplo, en dispositivos USB) y restaurarlas en cualquier momento, asegurando la integridad de la información.

Este proyecto está especialmente pensado para regiones geográficas del plaenta con conectividad limitada o fluctuante, así como para entornos donde las interrupciones eléctricas son frecuentes. El Cofre puede ser desplegado rápidamente en una computadora local funcionando como servidor y funcionará siempre que haya energía disponible, proporcionando una herramienta robusta para gestionar negocios incluso en condiciones adversas.

## 🎯 Características Principales

### 📦 Gestión de Inventario

- Control de productos con número de producto único (SKU)
- Seguimiento de precios de entrada y salida
- Gestión de Inventario
- Precios de productos configurables
- Número de productos configurables
- Recepción de mercancía
- Historial de recepción de mercancía
- Sistema variable de devoluciones

### 💼 Gestión de Servicios

- Catálogo de servicios
- Precios de servicios configurables
- Comisiones por servicio
- Historial de servicios prestados

### 👥 Gestión de Personal

- Registro de empleados
- Control de contratistas
- Sistema de comisiones
- Sistema de tarifa para localización.
- Gestión de pagos y salarios

### 📅 Agenda y Citas

- Calendario de citas
- Gestión de horarios
- Seguimiento de citas por empleado/contratista (Se viene pronto)

### 💰 Gestión Financiera

- Control de ventas
- Seguimiento de ganancias
- Reportes financieros

### 🔐 Seguridad y Respaldo

- Sistema de usuarios con roles
- Copias de seguridad locales
- Restauración de datos
- Control total de la base de datos

### 🌐 Multilenguaje

- Español (por defecto)
- English
- Français (Prochainement)
- Русский
- 中文 (即将推出)
- Deutsch (Demnächst verfügbar)
- Italiano (Prossimamente)
- Português (Em breve)
- 日本語 (近日公開)
- 한국어 (곧 출시 예정)

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 13, React 18, TailwindCSS
- **Backend**: API Routes de Next.js
- **Base de Datos**: SQLite (local)
- **Autenticación**: Sistema propio con JWT
- **UI**: shadcn/ui, Lucide Icons

## 📋 Requisitos del Sistema

Para correr este proyecto localmente se necesitan los siguientes requisitos:

### Windows

- Node.js 18.17 o superior
- npm 9.6.7 o superior
- 2GB RAM mínimo
- 1GB espacio en disco
- Windows 10/11

### macOS

- Node.js 18.17 o superior
- npm 9.6.7 o superior
- 2GB RAM mínimo
- 1GB espacio en disco
- macOS 10.15 (Catalina) o superior

## 🚀 Guía de Instalación Detallada para Windows

### 1. Instalar Node.js

1. Abre tu navegador web (Chrome, Firefox, etc.)
2. Ve a https://nodejs.org/
3. Descarga la versión LTS (Long Term Support) - es el botón verde grande
4. Ejecuta el archivo descargado (node-vXX.XX.X-x64.msi)
5. Sigue el asistente de instalación:
   - Haz clic en "Next"
   - Acepta los términos y condiciones
   - Haz clic en "Next"
   - Mantén la ubicación de instalación predeterminada
   - Haz clic en "Next"
   - Haz clic en "Install"
   - Espera a que termine la instalación
   - Haz clic en "Finish"

### 2. Instalar Git

1. Abre tu navegador web
2. Ve a https://git-scm.com/download/win
3. Descarga el instalador de Git para Windows
4. Ejecuta el archivo descargado (Git-2.XX.X-64-bit.exe)
5. Sigue el asistente de instalación:
   - Haz clic en "Next"
   - Acepta los términos y condiciones
   - Haz clic en "Next"
   - Mantén la ubicación de instalación predeterminada
   - Haz clic en "Next"
   - Selecciona "Use Git from Git Bash only"
   - Haz clic en "Next"
   - Selecciona "Use bundled OpenSSH"
   - Haz clic en "Next"
   - Selecciona "Use the OpenSSL library"
   - Haz clic en "Next"
   - Selecciona "Checkout as-is, commit Unix-style line endings"
   - Haz clic en "Next"
   - Selecciona "Use MinTTY"
   - Haz clic en "Next"
   - Selecciona "Default"
   - Haz clic en "Next"
   - Haz clic en "Install"
   - Espera a que termine la instalación
   - Haz clic en "Finish"

### 3. Clonar el Proyecto

1. Crea una carpeta para el proyecto:

   - Abre el Explorador de Windows
   - Ve a la unidad C:
   - Crea una nueva carpeta llamada "Proyectos"
   - Abre la carpeta "Proyectos"

2. Abre Git Bash:

   - Presiona la tecla Windows
   - Escribe "Git Bash"
   - Haz clic en la aplicación Git Bash

3. Navega a la carpeta de proyectos:

   ```bash
   cd /c/Proyectos
   ```

4. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/elcofre.git
   ```

5. Entra en la carpeta del proyecto:
   ```bash
   cd elcofre
   ```

### 4. Instalar Dependencias

1. Abre la Terminal de Windows:

   - Presiona la tecla Windows
   - Escribe "Terminal" o "Command Prompt"
   - Haz clic en la aplicación Terminal

2. Navega a la carpeta del proyecto:

   ```bash
   cd C:\Proyectos\elcofre
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```
   - Espera a que termine la instalación (puede tardar varios minutos)

### 5. Configurar el Proyecto

1. Crea el archivo de configuración:
   - En el Explorador de Windows, ve a C:\Proyectos\elcofre
   - Crea un nuevo archivo de texto
   - Nómbralo exactamente como ".env" (con el punto)
   - Abre el archivo con el Bloc de notas
   - Agrega estas líneas:
     ```
     JWT_SECRET=tu_clave_secreta_aqui
     DB_ENCRYPTION_KEY=tu_clave_encriptacion_aqui
     ```
   - Guarda el archivo

### 6. Compilar el Proyecto

1. En la Terminal de Windows (que ya debería estar abierta):
   ```bash
   npm run build
   ```
   - Espera a que termine la compilación

### 7. Configurar el Inicio Automático

1. Crea un archivo batch para iniciar el proyecto:

   - En el Explorador de Windows, ve a C:\Proyectos\elcofre
   - Crea un nuevo archivo de texto
   - Nómbralo como "start-elcofre.bat"
   - Abre el archivo con el Bloc de notas
   - Agrega estas líneas:
     ```batch
     @echo off
     cd /d C:\Proyectos\elcofre
     npm start
     ```
   - Guarda el archivo

2. Crea un acceso directo:
   - Haz clic derecho en el archivo "start-elcofre.bat"
   - Selecciona "Crear acceso directo"
   - Mueve el acceso directo a:
     C:\Users\[TuUsuario]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup

### 8. Iniciar el Proyecto

1. Para iniciar por primera vez:

   - Haz doble clic en el archivo "start-elcofre.bat"
   - El proyecto se iniciará y estará disponible en:
     http://localhost:3000

2. Para acceder al sistema:
   - Abre tu navegador web
   - Escribe: http://localhost:3000
   - Presiona Enter

### 9. Verificar que Todo Funciona

1. El sistema debería iniciar automáticamente cuando enciendas la computadora
2. Para verificar que está funcionando:
   - Abre tu navegador web
   - Escribe: http://localhost:3000
   - Deberías ver la página de inicio del sistema

### 10. Solución de Problemas Comunes

1. Si el sistema no inicia:

   - Verifica que Node.js está instalado:
     - Abre la Terminal
     - Escribe: `node --version`
     - Deberías ver un número de versión

2. Si la página no carga:

   - Verifica que el archivo "start-elcofre.bat" está en la carpeta correcta
   - Intenta ejecutar el archivo "start-elcofre.bat" manualmente

3. Si hay errores de dependencias:
   - Abre la Terminal
   - Navega a la carpeta del proyecto:
     ```bash
     cd C:\Proyectos\elcofre
     ```
   - Ejecuta:
     ```bash
     npm install
     ```

## 🚀 Instalación y Despliegue

### macOS

1. **Preparación del Sistema**

   ```bash
   # Instalar Homebrew si no está instalado
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

   # Instalar Node.js
   brew install node

   # Verificar instalación
   node --version
   npm --version
   ```

2. **Clonar el Repositorio**

   ```bash
   git clone https://github.com/tu-usuario/elcofre.git
   cd elcofre
   ```

3. **Instalar Dependencias**

   ```bash
   npm install
   ```

4. **Configurar Variables de Entorno**

   ```bash
   touch .env
   echo "JWT_SECRET=tu_clave_secreta_aqui" >> .env
   echo "DB_ENCRYPTION_KEY=tu_clave_encriptacion_aqui" >> .env
   ```

5. **Iniciar en Modo Desarrollo**

   ```bash
   npm run dev
   ```

6. **Compilar para Producción**

   ```bash
   npm run build
   ```

7. **Iniciar en Modo Producción**
   ```bash
   npm start
   ```

## 💾 Gestión de Datos

### Copias de Seguridad

- El sistema permite realizar copias de seguridad manuales en cualquier momento
- Las copias se guardan en formato SQLite encriptado
- Se pueden almacenar en dispositivos USB externos
- Proceso simple de restauración

### Restauración

1. Acceder a Configuración del Sistema
2. Seleccionar "Restaurar Copia de Seguridad"
3. Seleccionar el archivo .sqlite de respaldo
4. Confirmar la restauración

## 🔒 Seguridad

- Base de datos encriptada
- Autenticación mediante JWT
- Roles de usuario (Superadmin, Admin, Controller)
- Contraseñas hasheadas
- Control de acceso por rutas

## 📱 Acceso Local

El sistema está diseñado para funcionar en red local:

- Acceso desde cualquier dispositivo en la red local
- Compatible con tablets y móviles (diseño responsive)
- No requiere internet para funcionar
- Múltiples usuarios simultáneos

## ⚡ Operación sin Internet

El sistema está optimizado para funcionar sin conexión a internet:

- Base de datos local
- Sin dependencias externas
- Respaldos locales
- Restauración offline
- Actualizaciones manuales

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, lee el archivo CONTRIBUTING.md para detalles sobre nuestro código de conducta y el proceso para enviarnos pull requests.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo LICENSE.md para más detalles.

## 🌟 Agradecimientos

- A la comunidad de código abierto
- A todos los contribuidores
- A los usuarios que confían en nuestro sistema

## 📞 Soporte

Para soporte y preguntas, por favor abra un issue en el repositorio de GitHub.
