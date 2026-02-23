# Acceso como otro usuario (impersonación) — WindyMarket Admin

Funcionalidad para que el admin pueda acceder como cualquier usuario registrado con fines de soporte, sin necesidad de conocer su contraseña.

---

## Cómo funciona

1. El admin hace login normal con su cuenta (`infowindymarket@gmail.com` o `david.cladera@gmail.com`)
2. Con ese token, llama al endpoint de impersonación pasando el `_id` del usuario
3. El backend verifica que es admin y devuelve un token válido para ese usuario
4. El frontend guarda ese token igual que haría con un login normal

El token generado incluye `impersonatedBy: <adminId>` para trazabilidad en los logs del servidor.

---

## Endpoint

```
POST /api/auth/impersonate/:userId
Header: x-auth-token  →  token JWT del admin
```

### Respuesta exitosa (200)

```json
{
  "accessToken": "eyJhbGci...",
  "nombre": "JOAN CONTESTI",
  "id": "61960f6f8d4e400016369b52",
  "email": "jf.contesti@gmail.com",
  "impersonated": true
}
```

### Errores posibles

| Código | Motivo |
|--------|--------|
| 401 | No hay token o token inválido |
| 403 | El usuario del token no es admin |
| 404 | El userId no existe en la BD |

---

## Implementación en el Frontend

### 1. Función de llamada a la API

```js
// services/authService.js (o donde tengas las llamadas a la API)

export const impersonateUser = async (userId, adminToken) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/impersonate/${userId}`, {
    method: 'POST',
    headers: {
      'x-auth-token': adminToken,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('No se pudo impersonar al usuario');
  return res.json();
};
```

### 2. Botón en el panel admin (lista de usuarios)

```jsx
// Dentro del componente de la fila de usuario en /admin/usuarios

const handleImpersonate = async (userId) => {
  try {
    const adminToken = localStorage.getItem('token'); // o de donde leas el token
    const data = await impersonateUser(userId, adminToken);

    // Guardar el token del usuario impersonado igual que en el login normal
    // Guarda también el token admin para poder "volver" después
    localStorage.setItem('adminToken', adminToken);       // backup del admin
    localStorage.setItem('token', data.accessToken);      // token del usuario

    // Redirigir a la home o al perfil del usuario
    router.push('/');
    // Recargar estado de usuario en tu store/context si es necesario
  } catch (error) {
    console.error('Error impersonando usuario:', error);
  }
};

// En el JSX:
<button onClick={() => handleImpersonate(usuario._id)}>
  Acceder como este usuario
</button>
```

### 3. Botón "Volver a mi cuenta admin"

Muestra este botón cuando detectes que hay un `adminToken` guardado:

```jsx
const handleReturnToAdmin = () => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) return;

  localStorage.setItem('token', adminToken);
  localStorage.removeItem('adminToken');

  router.push('/admin/usuarios');
  // Recargar estado de usuario en tu store/context
};

// Mostrar solo cuando estás impersonando:
{localStorage.getItem('adminToken') && (
  <button onClick={handleReturnToAdmin}>
    Volver a mi cuenta admin
  </button>
)}
```

---

## Uso para el admin — paso a paso

1. Entra en el panel admin → `/admin/usuarios`
2. Localiza al usuario con problemas
3. Pulsa **"Acceder como este usuario"**
4. Navegas por la plataforma como si fueras ese usuario y puedes reproducir el problema
5. Cuando termines, pulsa **"Volver a mi cuenta admin"** (aparece en la barra superior u donde decidas mostrarlo)
6. Tu sesión de admin se restaura automáticamente

---

## Seguridad

- El endpoint requiere un JWT de admin válido (`isAdmin: true` en la BD)
- Sin ese token, el endpoint devuelve 403
- Cada uso queda registrado en los logs del servidor:
  ```
  [IMPERSONATE] Admin <adminId> accedió como usuario <userId> (email@ejemplo.com)
  ```
- El token generado tiene la misma caducidad que un login normal (12 horas)
- El token impersonado NO tiene permisos de admin aunque el usuario impersonado fuera admin

---

## Variables de entorno necesarias

No se necesitan variables adicionales. Usa las mismas que el login normal (`SECRETA`).
