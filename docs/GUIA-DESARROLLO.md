# El Cofre — Guia de Desarrollo

## Requisitos

- Node.js 18.17 o superior
- pnpm (o npm)
- Git

---

## Estructura del Proyecto

```
el-cofre/
├── electron/          ← Proceso principal de Electron (ventana del escritorio)
├── server/            ← API backend (Express + SQLite)
├── src/               ← Frontend (React + TailwindCSS)
├── shared/            ← Codigo compartido entre la app y el keygen
├── keygen/            ← Herramienta CLI para generar llaves de licencia
├── warehouse.db       ← Base de datos SQLite (toda la data del negocio)
├── vite.config.ts     ← Configuracion de Vite (frontend)
├── tsconfig.json      ← TypeScript base
├── tsconfig.node.json ← TypeScript para electron/ y server/
├── tsconfig.web.json  ← TypeScript para src/ (frontend)
└── electron-builder.yml ← Configuracion para empaquetar .exe y .dmg
```

---

## Correr la Aplicacion en Desarrollo

Necesitas 2 terminales:

### Terminal 1 — Backend (Express API)

```bash
npx tsc -p tsconfig.node.json
node dist-electron/server/index.js
```

Esto compila el backend y lo ejecuta en el puerto 3847.

### Terminal 2 — Frontend (React con hot reload)

```bash
pnpm dev:frontend
```

Esto abre Vite en http://localhost:5173 con recarga automatica.

Abre **http://localhost:5173** en tu navegador para ver la aplicacion.

### Flujo de la aplicacion

1. La app verifica si hay una licencia activa
2. Si no hay licencia → pantalla de activacion (muestra el codigo de maquina)
3. Si hay licencia → verifica si es la primera vez → pantalla de setup (crear cuenta admin)
4. Si ya hay cuenta → pantalla de login
5. Despues de login → dashboard

---

## Sistema de Licencias

### Conceptos Clave

- **Codigo de maquina**: Un codigo unico generado a partir del hardware de la computadora (CPU, MAC address, etc). Ejemplo: `COFRE-KM2N-6RT3`
- **Llave de licencia**: Un codigo firmado digitalmente que activa el software en una maquina especifica
- **Par de llaves Ed25519**: Una llave privada (solo tuya, firma las licencias) y una llave publica (dentro de la app, verifica las firmas)

### Tipos de licencia

| Tipo | Duracion | Uso |
|------|----------|-----|
| `6month` | 6 meses desde la activacion | Clientes con contrato de mantenimiento |
| `lifetime` | Para siempre | Clientes que pagan una vez |

### Periodo de gracia

Cuando una licencia de 6 meses expira, el software sigue funcionando por **15 dias** con un aviso en pantalla. Despues de 15 dias, se bloquea completamente y solo se puede usar con una nueva llave.

### Proteccion contra manipulacion del reloj

Si alguien atrasa el reloj de su computadora mas de 24 horas, la app se bloquea con un mensaje de error.

---

## Herramienta CLI: `cofre`

Esta es la herramienta que usas tu y tus operadores para generar llaves de licencia.

### Instalar por primera vez (en tu maquina)

```bash
cd keygen
pnpm install
pnpm build
npm install -g .
```

Verificar que se instalo:

```bash
cofre --help
```

### Generar el par de llaves Ed25519 (solo una vez)

```bash
cofre init
```

Esto crea:
- `~/.cofre-keygen/private.key` — LLAVE PRIVADA (nunca compartir publicamente)
- `~/.cofre-keygen/public.key` — llave publica (se embebe en la app)

**IMPORTANTE**: Hacer backup de la carpeta `~/.cofre-keygen/` en un USB seguro. Si se pierde la llave privada, no se pueden generar mas licencias.

### Embeber la llave publica en la app

Despues de ejecutar `cofre init`, copiar la llave publica al proyecto:

```bash
cofre public-key > electron/license/public.key
```

Esto se hace **una sola vez**, o cuando se regenera el par de llaves.

### Obtener el codigo de maquina de una computadora

Si tienes acceso a la computadora con el proyecto:

```bash
npx tsc -p tsconfig.node.json
node -e "
const { getMachineCode } = require('./dist-electron/electron/license/machine-id.js');
getMachineCode().then(code => { console.log(code); process.exit(0); });
"
```

Esto imprime algo como: `COFRE-KM2N-6RT3`

Si no tienes acceso, el operador lee el codigo de la pantalla de activacion de la app del cliente.

### Generar una llave de licencia

```bash
# Licencia de 6 meses
cofre generate --machine COFRE-KM2N-6RT3 --type 6month

# Licencia de por vida
cofre generate --machine COFRE-KM2N-6RT3 --type lifetime
```

Reemplazar `COFRE-KM2N-6RT3` con el codigo de maquina real del cliente.

La salida muestra la llave que se escribe en la app del cliente:

```
Key generated:
  Machine:    COFRE-KM2N-6RT3
  Type:       6-month
  Issued:     2026-04-01
  Expires:    2026-10-01
  Key:        038R-Q9ME-D6JQ-HUCF-DP5Q-...
```

### Ver la llave publica actual

```bash
cofre public-key
```

---

## Distribuir la Herramienta CLI a Operadores

### Paso 1: Crear el archivo .tgz

```bash
cd keygen
pnpm build
npm pack
```

Esto genera `keygen/cofre-1.0.0.tgz` (3.6 KB).

### Paso 2: El operador instala en su laptop

El operador necesita tener Node.js instalado. Despues:

```bash
npm install -g cofre-1.0.0.tgz
```

Verificar:

```bash
cofre --help
```

### Paso 3: Copiar las llaves al operador

Copiar la carpeta `~/.cofre-keygen/` de tu maquina a un USB seguro. El operador la copia a su home:

```bash
cp -r /USB/.cofre-keygen ~/
```

Ahora el operador puede generar llaves que la app aceptara.

### Actualizar la herramienta

Cuando hagas cambios al codigo en `keygen/`:

```bash
cd keygen
pnpm build
npm pack
```

Enviar el nuevo `.tgz` al operador. El operador ejecuta:

```bash
npm install -g cofre-X.X.X.tgz
```

(Cambiar la version en `keygen/package.json` antes de empaquetar)

---

## Compilar y Empaquetar la App

### Compilar todo

```bash
pnpm build
```

Esto compila el backend (TypeScript → JavaScript en `dist-electron/`) y el frontend (React → HTML/JS en `dist/`).

### Crear instalador para macOS

```bash
pnpm package:mac
```

Genera un `.dmg` en la carpeta `release/`.

### Crear instalador para Windows

```bash
pnpm package:win
```

Genera un `.exe` en la carpeta `release/`.

---

## Flujo del Operador en Campo

```
1. Visitar al cliente
2. Abrir la app en la computadora del cliente
3. Leer el Codigo de Maquina de la pantalla
4. En tu laptop: cofre generate --machine COFRE-XXXX-XXXX --type 6month
5. Escribir la llave en la computadora del cliente
6. La app se activa
7. Cobrar por el servicio
8. Volver en 6 meses
```

### Renovacion (cada 6 meses)

```
1. Ir a Configuracion → Licencia en la app del cliente
2. Leer el Codigo de Maquina
3. Generar nueva llave: cofre generate --machine COFRE-XXXX-XXXX --type 6month
4. Escribir la llave en la app
5. La licencia se renueva por 6 meses mas
```

### Reinstalacion

Si el cliente reinstala la app:

```
1. Antes de reinstalar: Configuracion → Sistema → Descargar Backup
2. Guardar el archivo .sqlite en un USB
3. Instalar la app de nuevo
4. Activar con una llave nueva (la anterior no se puede reusar)
5. Crear cuenta admin
6. Ir a Configuracion → Sistema → Restaurar Backup
7. Toda la data esta de vuelta
```

---

## Comandos Rapidos

| Que | Comando |
|-----|---------|
| Correr backend | `npx tsc -p tsconfig.node.json && node dist-electron/server/index.js` |
| Correr frontend | `pnpm dev:frontend` |
| Compilar todo | `pnpm build` |
| Empaquetar macOS | `pnpm package:mac` |
| Empaquetar Windows | `pnpm package:win` |
| Generar llave 6 meses | `cofre generate --machine COFRE-XXXX-XXXX --type 6month` |
| Generar llave permanente | `cofre generate --machine COFRE-XXXX-XXXX --type lifetime` |
| Inicializar par de llaves | `cofre init` |
| Ver llave publica | `cofre public-key` |
| Crear tarball del CLI | `cd keygen && pnpm build && npm pack` |
| Instalar CLI desde tarball | `npm install -g cofre-X.X.X.tgz` |
| Obtener codigo de maquina | `node -e "require('./dist-electron/electron/license/machine-id.js').getMachineCode().then(c=>{console.log(c);process.exit(0)})"` |

---

## Seguridad

- La **llave privada** (`~/.cofre-keygen/private.key`) nunca se comparte publicamente ni se sube a git
- La **llave publica** se embebe en la app — incluso si alguien la extrae del `.exe`, no puede generar llaves validas sin la privada
- Cada llave de licencia se puede usar **una sola vez** — si se intenta reusar, la app la rechaza
- Las llaves estan atadas a una **maquina especifica** — no funcionan en otra computadora
- Si se pierde la llave privada, hay que generar un nuevo par y recompilar la app
