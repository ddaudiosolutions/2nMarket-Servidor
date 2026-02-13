# ⏰ Configuración del Cron Job - Desactivar Productos Antiguos

Este documento explica cómo configurar y usar el script de desactivación automática de productos.

---

## 📋 ¿Qué hace el script?

El script `desactivarProductosAntiguos.js`:
- Busca productos activos y no vendidos
- Calcula su antigüedad usando la fecha más reciente de:
  1. `fechaActualizacion` (si editaron el producto)
  2. `fechaReactivar` (si lo reactivaron)
  3. `creado` (fecha de creación)
- Desactiva productos con más de **6 meses** sin actividad

---

## ⚠️ IMPORTANTE: Base de Datos

El script usa la variable **`DB_MONGO`** del archivo `.env`.

**Para ejecutar en LOCAL:**
```bash
# En .env, comenta la línea de producción y descomenta la local:
# DB_MONGO=mongodb+srv://userReactMarket:...@cluster0.gdgcd.mongodb.net/mernReactMarket
DB_MONGO=mongodb+srv://userReactMarket:...@cluster0.gdgcd.mongodb.net/mernReactMarket_Local
```

**Para ejecutar en PRODUCCIÓN:**
```bash
# En .env, usa la BD de producción (sin _Local):
DB_MONGO=mongodb+srv://userReactMarket:...@cluster0.gdgcd.mongodb.net/mernReactMarket
# DB_MONGO=mongodb+srv://userReactMarket:...@cluster0.gdgcd.mongodb.net/mernReactMarket_Local
```

---

## 🧪 1. Probar Manualmente (PRIMERO)

Antes de automatizarlo, pruébalo manualmente:

```bash
# En la raíz del proyecto
node desactivarProductosAntiguos.js
```

**Salida esperada:**
```
✅ Conectado a MongoDB
📅 Fecha límite: 2025-08-11T...
🔍 Buscando productos con más de 6 meses sin actividad...
📦 Total productos activos no vendidos: 45
⚠️  Productos a desactivar: 12

📋 Lista de productos a desactivar:
  1. Quilla olas 25cm - Última creación: 16/9/2021
  2. Pie de mástil 0, SDM - Última creación: 16/9/2021
  ...

✅ Productos desactivados: 12
🎉 Proceso completado exitosamente
```

---

## ⚙️ 2. Configurar Meses de Antigüedad

En el archivo `desactivarProductosAntiguos.js`, línea 6:

```javascript
const MESES_ANTIGUEDAD = 6;  // Cambiar este valor (3, 6, 9, 12...)
```

---

## 🤖 3. Automatizar con Cron Job

### Opción A: **Cron Job del Sistema (Linux/Mac)**

1. Editar el crontab:
```bash
crontab -e
```

2. Añadir una de estas líneas según frecuencia deseada:

```bash
# Ejecutar cada día a las 3:00 AM
0 3 * * * cd /ruta/a/tu/proyecto && node desactivarProductosAntiguos.js >> logs/cron.log 2>&1

# Ejecutar cada domingo a las 2:00 AM
0 2 * * 0 cd /ruta/a/tu/proyecto && node desactivarProductosAntiguos.js >> logs/cron.log 2>&1

# Ejecutar el día 1 de cada mes a las 4:00 AM
0 4 1 * * cd /ruta/a/tu/proyecto && node desactivarProductosAntiguos.js >> logs/cron.log 2>&1
```

**Importante:** Reemplaza `/ruta/a/tu/proyecto` con la ruta real:
```bash
# Ejemplo:
0 3 * * * cd /Volumes/Disco\ 1/MY_BOOTCAMP/REACT\ BOOTCAMP/WindyMarket/2nMarket-Servidor && node desactivarProductosAntiguos.js >> logs/cron.log 2>&1
```

3. Crear carpeta de logs:
```bash
mkdir -p logs
```

4. Verificar que el cron está activo:
```bash
crontab -l
```

---

### Opción B: **node-cron (desde Node.js)**

Si prefieres controlarlo desde Node.js:

1. Instalar `node-cron`:
```bash
npm install node-cron
```

2. Crear archivo `cronJobs.js` en la raíz:
```javascript
const cron = require('node-cron');
const { exec } = require('child_process');

// Ejecutar cada día a las 3:00 AM
cron.schedule('0 3 * * *', () => {
  console.log('🕐 Ejecutando desactivación de productos antiguos...');

  exec('node desactivarProductosAntiguos.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
});

console.log('⏰ Cron job de desactivación de productos configurado');
```

3. Ejecutar junto con tu servidor (en `index.js` o `app.js`):
```javascript
// Al inicio del archivo
require('./cronJobs');
```

---

### Opción C: **PM2 (Recomendado para Producción)**

Si usas PM2 para gestionar tu app:

1. Crear archivo `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'windy-market-api',
      script: './index.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'desactivar-productos-cron',
      script: './desactivarProductosAntiguos.js',
      cron_restart: '0 3 * * *', // Cada día a las 3:00 AM
      autorestart: false,
      watch: false,
    }
  ]
};
```

2. Iniciar con PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📊 4. Monitorear Logs

### Con cron del sistema:
```bash
tail -f logs/cron.log
```

### Con PM2:
```bash
pm2 logs desactivar-productos-cron
```

---

## 🔧 5. Frecuencias Recomendadas

| Frecuencia | Cron Expression | Uso |
|------------|----------------|-----|
| Cada día 3AM | `0 3 * * *` | ✅ Recomendado |
| Cada domingo 2AM | `0 2 * * 0` | Para tráfico bajo |
| 1º de mes 4AM | `0 4 1 * *` | Si prefieres mensual |
| Cada 12 horas | `0 */12 * * *` | Para testing |

---

## ⚠️ Importante

1. **Probar primero manualmente** antes de automatizar
2. **Hacer backup** de la base de datos antes de la primera ejecución
3. **Verificar logs** regularmente para detectar errores
4. El script solo afecta productos:
   - ✅ Activos (`activo: true`)
   - ✅ No vendidos (`vendido: false`)
   - ✅ Con más de 6 meses sin actividad

---

## 🐛 Troubleshooting

**Problema:** El cron no se ejecuta
- Verificar que el cron está activo: `crontab -l`
- Revisar logs del sistema: `tail -f /var/log/syslog | grep CRON`
- Verificar permisos del archivo: `chmod +x desactivarProductosAntiguos.js`

**Problema:** Error de conexión a MongoDB
- Verificar que el archivo `.env` existe y tiene `DB_MONGO`
- Comprobar conexión: `node -e "require('dotenv').config(); console.log(process.env.DB_MONGO)"`
- Asegúrate de que `DB_MONGO` apunte a la BD correcta (local o producción)

---

## 📝 Ejemplo Completo

```bash
# 1. Probar manualmente
node desactivarProductosAntiguos.js

# 2. Crear carpeta de logs
mkdir -p logs

# 3. Configurar cron (cada día a las 3AM)
crontab -e
# Añadir:
0 3 * * * cd /ruta/completa/al/proyecto && node desactivarProductosAntiguos.js >> logs/cron.log 2>&1

# 4. Verificar
crontab -l

# 5. Ver logs al día siguiente
tail -f logs/cron.log
```

---

¡Listo! 🎉
