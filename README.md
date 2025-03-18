# El Cofre - Sistema de Gestión de Negocios Offline

## 🌟 Descripción

El Cofre es una solución integral y descentralizada diseñada para pequeñas y medianas empresas que buscan operar sin necesidad de conexión a internet. Este sistema es completamente agnóstico en términos políticos y monetarios, el usuario tiene control total sobre sus datos.

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
- Русский (Próximamente)
- Français (Prochainement)
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

## 🚀 Instalación y Despliegue

### Windows

1. **Preparación del Sistema**

   ```bash
   # Instalar Node.js desde https://nodejs.org/
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

   - Crear archivo `.env` en la raíz del proyecto:

   ```env
   JWT_SECRET=tu_clave_secreta_aqui
   DB_ENCRYPTION_KEY=tu_clave_encriptacion_aqui
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
