# TRINIsend — Implementación pago Bizum (Frontend)

## Contexto

El flujo de solicitudes de envío ahora tiene un paso de pago manual (Bizum) antes de enviar las etiquetas.

### Estados de una solicitud

```
pendiente → confirmada → completada
                ↑
           (pagado: true/false)
```

El campo `pagado` es un **booleano independiente** del campo `estado`.

| `estado`    | `pagado` | Significado                                      |
|-------------|----------|--------------------------------------------------|
| `pendiente` | `false`  | Solicitud recibida, admin pendiente de revisar   |
| `confirmada`| `false`  | Admin fijó precio, esperando pago Bizum          |
| `confirmada`| `true`   | Pago recibido, pendiente de enviar etiquetas     |
| `completada`| `true`   | Etiquetas enviadas, envío en marcha              |

---

## Endpoints nuevos / modificados

### Nuevo — Marcar pago recibido
```
PUT /api/envios/solicitudes/:id/pago
Header: x-auth-token  →  token JWT del admin
```
- Sin body necesario
- Respuesta: solicitud actualizada con `pagado: true`
- Errores: `400` si la solicitud no está en estado `confirmada`

### Modificado — Completar solicitud (con etiquetas adjuntas)
```
PUT /api/envios/solicitudes/:id/completar
Header: x-auth-token  →  token JWT del admin
Content-Type: multipart/form-data
Campo: etiqueta  →  archivo PDF o imagen con las etiquetas
```
- Ahora devuelve **400** si `pagado === false`
- El botón "Enviar etiquetas" solo debe mostrarse/habilitarse cuando `pagado === true`
- El archivo se envía como adjunto al email del cliente automáticamente
- Si no se adjunta archivo, la solicitud se completa igualmente (sin email de etiquetas)

---

## Cambios en el panel admin (`/admin/trinisend` o similar)

### Tabla de solicitudes

Añadir columna o indicador visual de pago:

```jsx
// Indicador de pago junto al estado
{solicitud.pagado
  ? <span style={{ color: 'green' }}>✅ Pagado</span>
  : <span style={{ color: 'orange' }}>⏳ Pendiente pago</span>
}
```

### Botones de acción por fila

La lógica de qué botones mostrar según el estado:

```jsx
// Botón "Marcar pago recibido"
// Solo cuando: estado === 'confirmada' && pagado === false
{solicitud.estado === 'confirmada' && !solicitud.pagado && (
  <button onClick={() => handleMarcarPagado(solicitud._id)}>
    Marcar pago recibido
  </button>
)}

// Botón "Enviar etiquetas / Completar"
// Solo cuando: estado === 'confirmada' && pagado === true
{solicitud.estado === 'confirmada' && solicitud.pagado && (
  <label style={{ cursor: 'pointer' }}>
    <input
      type="file"
      accept=".pdf,image/*"
      style={{ display: 'none' }}
      onChange={(e) => handleCompletar(solicitud._id, e.target.files[0])}
    />
    Enviar etiquetas
  </label>
)}
```

### Función de llamada a la API — Marcar pagado

```js
const handleMarcarPagado = async (solicitudId) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/envios/solicitudes/${solicitudId}/pago`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('Error al marcar el pago');

    const solicitudActualizada = await res.json();
    // Actualizar el estado local de la lista de solicitudes
    setSolicitudes(prev =>
      prev.map(s => s._id === solicitudId ? solicitudActualizada : s)
    );
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Función de llamada a la API — Enviar etiquetas

```js
// El archivo viene del <input type="file"> — e.target.files[0]
const handleCompletar = async (solicitudId, archivo) => {
  try {
    const token = localStorage.getItem('token');

    const formData = new FormData();
    if (archivo) {
      formData.append('etiqueta', archivo);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/envios/solicitudes/${solicitudId}/completar`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
        // NO poner Content-Type aquí — el navegador lo añade automáticamente con el boundary correcto
      },
      body: formData,
    });

    if (!res.ok) throw new Error('Error al completar la solicitud');

    const solicitudActualizada = await res.json();
    setSolicitudes(prev =>
      prev.map(s => s._id === solicitudId ? solicitudActualizada : s)
    );
  } catch (error) {
    console.error('Error:', error);
  }
};
```

> **Importante:** No añadir `Content-Type: 'multipart/form-data'` manualmente en los headers. El navegador lo gestiona solo con el boundary correcto cuando usas `FormData`.

---

## Flujo completo desde el panel admin

1. Solicitud nueva → aparece con estado `pendiente`
2. Admin introduce precio real → pulsa "Confirmar precio"
   - Estado pasa a `confirmada`, `pagado: false`
   - Cliente recibe email con precio + instrucciones Bizum
3. Cliente paga por Bizum al número configurado
4. Admin verifica el pago en su app bancaria
5. Admin pulsa **"Marcar pago recibido"** en el panel
   - `pagado` pasa a `true`
   - Admin recibe email de confirmación recordándole que hay que preparar etiquetas
6. Admin genera las etiquetas de envío (PDF desde la plataforma de transporte)
7. Admin pulsa **"Enviar etiquetas"** en el panel → se abre selector de archivo
8. Admin selecciona el PDF de etiquetas
   - El PDF se adjunta automáticamente en un email al cliente
   - Estado pasa a `completada`

---

## Variables de entorno necesarias (ya configuradas en Railway)

No se necesitan variables adicionales en el frontend.
El número Bizum se muestra en el email que recibe el cliente directamente desde el backend.
