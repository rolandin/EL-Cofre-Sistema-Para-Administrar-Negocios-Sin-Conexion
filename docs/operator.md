# Guia del Operador — El Cofre

Esta guia cubre todo lo que un operador necesita saber para instalar, activar, mantener y actualizar El Cofre en las computadoras de los clientes.

---

## Requisitos del Operador

- La herramienta `cofre` instalada en tu laptop (ver seccion "Instalar la herramienta cofre")
- La carpeta `~/.cofre-keygen/` con las llaves Ed25519 (proporcionada por el administrador en un USB)
- Node.js instalado en tu laptop (descargar de https://nodejs.org/)

---

## Instalar la herramienta cofre

### macOS / Linux

```bash
npm install -g ./cofre-1.0.0.tgz
```

### Windows (PowerShell)

```powershell
cd C:\ruta\donde\esta\el\archivo
npm install -g .\cofre-1.0.0.tgz
```

### Verificar la instalacion

```bash
cofre --help
```

### Copiar las llaves de firma

El administrador te proporcionara un USB con la carpeta `.cofre-keygen`. Copiar a tu carpeta de usuario:

**macOS / Linux:**
```bash
cp -r /Volumes/USB/.cofre-keygen ~/
```

**Windows (PowerShell):**
```powershell
xcopy /E /I E:\.cofre-keygen %USERPROFILE%\.cofre-keygen
```

(Cambiar `E:\` por la letra real del USB)

### Actualizar la herramienta cofre

Cuando el administrador te de un nuevo archivo `.tgz`:

```bash
npm install -g ./cofre-X.X.X.tgz
```

### Desinstalar

```bash
npm uninstall -g cofre
```

---

## Instalar El Cofre en la computadora de un cliente

### Paso 1: Ejecutar el instalador

- **Windows**: Doble clic en `ElCofre-Setup-X.X.X.exe`, seguir el asistente
- **macOS**: Abrir `ElCofre-X.X.X.dmg`, arrastrar la app a Aplicaciones

El cliente NO necesita Node.js instalado. Todo esta incluido en el instalador.

### Paso 2: Abrir la aplicacion

Al abrir por primera vez, la app muestra la pantalla de **Activacion**:

```
┌─────────────────────────────┐
│                             │
│   Your Machine Code:        │
│   ┌───────────────────┐     │
│   │  COFRE-A7X9-M3K2  │     │
│   └───────────────────┘     │
│                             │
│   Enter License Key:        │
│   ┌───────────────────┐     │
│   │                   │     │
│   └───────────────────┘     │
│                             │
│   [Activate License]        │
└─────────────────────────────┘
```

### Paso 3: Generar la llave de licencia

En tu laptop, abrir una terminal y ejecutar:

```bash
cofre generate --machine COFRE-A7X9-M3K2 --type 6month
```

Reemplazar `COFRE-A7X9-M3K2` con el codigo que aparece en la pantalla del cliente.

Tipos de licencia disponibles:

| Tipo | Comando | Duracion |
|------|---------|----------|
| 6 meses | `--type 6month` | 6 meses desde la activacion |
| 1 ano | `--type 1year` | 12 meses desde la activacion |
| Permanente | `--type lifetime` | No expira nunca |

La salida del comando muestra la llave:

```
Key generated:
  Machine:    COFRE-A7X9-M3K2
  Type:       6-month
  Issued:     2026-04-01
  Expires:    2026-10-01
  Key:        038R-Q9ME-D6JQ-HUCF-DP5Q-99JU-...
```

### Paso 4: Activar la licencia

Copiar la llave completa (la linea que empieza con `Key:`) y pegarla en el campo "Enter License Key" de la app del cliente. Hacer clic en **Activate License**.

### Paso 5: Crear la cuenta de administrador

Despues de activar, la app lleva a la pantalla de Setup. Crear la cuenta del administrador:

- **Username**: minimo 3 caracteres
- **Password**: minimo 6 caracteres

Guardar estas credenciales y darselas al cliente.

### Paso 6: Iniciar sesion

La app redirige al login. Ingresar con el usuario y contraseña recien creados. El cliente ya puede usar el sistema.

---

## Renovar la licencia (cada 6 meses o 1 ano)

Cuando la licencia esta por vencer, la app muestra un aviso amarillo en el dashboard. Despues de vencer, hay un periodo de gracia de **15 dias** con un aviso naranja. Despues de 15 dias, la app se bloquea.

### Pasos para renovar

1. Ir a **Configuracion** → pestana **License** en la app del cliente
2. Anotar el **Machine Code** que se muestra
3. En tu laptop: `cofre generate --machine COFRE-XXXX-XXXX --type 6month`
4. Hacer clic en **Enter New Key** en la app del cliente
5. Pegar la nueva llave y hacer clic en **Activate Key**
6. La licencia se renueva

### Si la app ya esta bloqueada

Si pasaron mas de 15 dias desde que expiro:

1. Abrir la app — aparece la pantalla de Activacion
2. Anotar el Machine Code
3. Generar nueva llave: `cofre generate --machine COFRE-XXXX-XXXX --type 6month`
4. Pegar la llave y activar
5. La app se desbloquea, toda la data sigue intacta

---

## Actualizar El Cofre a una nueva version

### Paso 1: Hacer backup de la base de datos

En la app del cliente, ir a **Configuracion** → **System Settings** → **Descargar Backup**. Esto descarga un archivo `.sqlite`. Guardar en un USB.

### Paso 2: Desinstalar la version anterior

- **Windows**: Panel de Control → Programas → Desinstalar "El Cofre"
- **macOS**: Arrastrar la app de Aplicaciones a la papelera

### Paso 3: Instalar la nueva version

Ejecutar el nuevo instalador (`ElCofre-Setup-X.X.X.exe` o `.dmg`).

### Paso 4: Activar con nueva llave

Al abrir la app, aparece la pantalla de Activacion. La llave anterior no se puede reusar — generar una nueva:

```bash
cofre generate --machine COFRE-XXXX-XXXX --type 6month
```

El Machine Code sera el mismo (es la misma maquina).

### Paso 5: Crear cuenta admin temporal

La app pide crear una cuenta. Crear una cuenta temporal (se sobreescribira con el backup).

### Paso 6: Restaurar el backup

1. Ir a **Configuracion** → **System Settings**
2. Buscar la opcion de **Restaurar Backup**
3. Seleccionar el archivo `.sqlite` del USB
4. Confirmar la restauracion

Toda la data vuelve: usuarios, productos, ventas, servicios, todo. Despues de restaurar, iniciar sesion con las credenciales originales del cliente (no las temporales).

---

## Resetear la contrasena de un usuario

Si un usuario olvido su contrasena y no hay otro admin que pueda cambiarla, se puede resetear directamente en la base de datos.

### Requisitos

- Node.js instalado en la maquina del cliente (descargar de https://nodejs.org/)
- Acceso a la terminal (PowerShell en Windows, Terminal en macOS)

### Ubicacion de la base de datos

La base de datos se llama `warehouse.db`. Segun el sistema:

**App compilada (.exe) en Windows:**
```
C:\Users\<NombreDelUsuario>\AppData\Local\El Cofre\warehouse.db
```

**App compilada (.dmg) en macOS:**
```
~/Library/Application Support/El Cofre/warehouse.db
```

**En modo desarrollo:**
```
La carpeta raiz del proyecto (donde esta package.json)
```

Para encontrar la carpeta AppData en Windows, abrir PowerShell y ejecutar:
```powershell
echo $env:LOCALAPPDATA
```

### Paso 1: Instalar las dependencias necesarias (una sola vez)

Abrir una terminal en la computadora del cliente y ejecutar:

```bash
npm install -g better-sqlite3 bcryptjs
```

### Paso 2: Ejecutar el script de reseteo

**Windows (PowerShell):**
```powershell
node -e "const Database = require('better-sqlite3'); const bcrypt = require('bcryptjs'); const db = new Database('C:\\Users\\NombreDelUsuario\\AppData\\Local\\El Cofre\\warehouse.db'); const hash = bcrypt.hashSync('NuevaContraseña123', 10); db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hash, 'Admin'); console.log('Contraseña actualizada');"
```

**macOS / Linux:**
```bash
node -e "
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('$HOME/Library/Application Support/El Cofre/warehouse.db');
const hash = bcrypt.hashSync('NuevaContraseña123', 10);
db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hash, 'Admin');
console.log('Contraseña actualizada');
"
```

Cambiar en el script:
- La ruta del `warehouse.db` segun la ubicacion real
- `Admin` por el nombre de usuario real
- `NuevaContraseña123` por la nueva contrasena

### Paso 3: Verificar

Abrir la app e iniciar sesion con la nueva contrasena. Pedir al usuario que la cambie desde la app despues.

### Nota importante

Despues de resetear, se puede desinstalar Node.js de la maquina del cliente si no se necesita para nada mas:

- **Windows**: Panel de Control → Programas → Desinstalar Node.js
- **macOS**: `brew uninstall node` o eliminar manualmente

---

## Resolucion de problemas

### La app muestra "System date error detected"

El reloj de la computadora esta atrasado. Esto pasa si alguien cambio la fecha del sistema manualmente.

**Solucion**: Corregir la fecha y hora del sistema:
- **Windows**: Configuracion → Hora e idioma → Activar "Ajustar hora automaticamente"
- **macOS**: Preferencias del Sistema → Fecha y Hora → Activar "Ajustar fecha y hora automaticamente"

Si despues de corregir la hora la app sigue bloqueada, puede que la licencia haya expirado durante el tiempo con la hora incorrecta. Generar una nueva llave para desbloquear.

### La llave dice "This key has already been used"

Cada llave solo se puede usar una vez. Generar una llave nueva:

```bash
cofre generate --machine COFRE-XXXX-XXXX --type 6month
```

### La llave dice "Key is not valid for this machine"

La llave fue generada para una maquina diferente. Verificar que el Machine Code usado en `cofre generate` coincide exactamente con el que muestra la app.

### La app no abre / pantalla en blanco

1. Cerrar completamente la app
2. Volver a abrir
3. Si persiste, verificar que no haya otra instancia corriendo (revisar el administrador de tareas)

### Error al restaurar backup

El archivo `.sqlite` debe ser un backup valido de El Cofre. Verificar que:
- El archivo termina en `.sqlite`
- No esta corrupto (intentar abrirlo con otro gestor de SQLite)
- Es un backup de El Cofre, no de otro programa

---

## Resumen rapido de comandos

| Accion | Comando |
|--------|---------|
| Generar llave 6 meses | `cofre generate --machine COFRE-XXXX-XXXX --type 6month` |
| Generar llave 1 ano | `cofre generate --machine COFRE-XXXX-XXXX --type 1year` |
| Generar llave permanente | `cofre generate --machine COFRE-XXXX-XXXX --type lifetime` |
| Ver ayuda | `cofre --help` |
| Ver ayuda de generate | `cofre generate --help` |
| Instalar cofre desde tgz | `npm install -g ./cofre-X.X.X.tgz` |
| Desinstalar cofre | `npm uninstall -g cofre` |

---

## Flujo tipico de visita al cliente

```
1. Llegar a la ubicacion del cliente
2. Abrir la app en la computadora del cliente
3. Si la app muestra "Activation":
   a. Leer el Machine Code de la pantalla
   b. En tu laptop: cofre generate --machine COFRE-XXXX-XXXX --type 6month
   c. Pegar la llave en la app del cliente
   d. Si es primera vez: crear cuenta admin
4. Si la app muestra "Login":
   a. El cliente inicia sesion normalmente
   b. Si olvido la contrasena: resetear con el script de Node.js
5. Verificar que todo funcione
6. Cobrar por el servicio
7. Volver en 6 meses (o 1 ano, segun el tipo de licencia)
```
