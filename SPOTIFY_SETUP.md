# 🎵 Guía de Configuración - Reproductor Spotify Minimalista

## ⚠️ Requisitos Previos

Antes de comenzar, necesitas:
- ✅ Una cuenta de **Spotify** (gratis o premium)
- ✅ **Spotify abierto en tu computadora** (al menos en la web: open.spotify.com)
- ✅ El reproductor activo en Spotify (tu navegador controlará el que está reproduciendo)
- ✅ Una conexión a internet

**Nota**: La API de Spotify requiere que haya un dispositivo/aplicación Spotify activo donde pueda enviar comandos.

## ¿Qué se ha añadido?

Se ha integrado un reproductor de Spotify minimalista y discreto que:
- ✅ Permite reproducir y pausar música
- ✅ Cambiar entre canciones (anterior/siguiente)
- ✅ Seleccionar playlists de tu cuenta
- ✅ Mostrar la canción actual con portada
- ✅ Mantiene la música reproduciéndose al navegar
- ✅ Diseño moderno y minimalista en la esquina inferior derecha
- ✅ Sin ventanas emergentes de Spotify

## Pasos de Configuración

### 1. Registrar tu aplicación en Spotify Developer

1. Ve a https://developer.spotify.com/dashboard
2. Inicia sesión con tu cuenta de Spotify (o crea una si no tienes)
3. Haz clic en **"Create an App"**
4. Acepta los términos y confirma
5. Dale un nombre a tu app, por ejemplo: "Dev3D Player"
6. Acepta los términos nuevamente

### 2. Obtener tu Client ID

1. En el dashboard de tu app, busca tu **Client ID**
2. Cópialo (es una cadena larga de caracteres)

### 3. Configurar el archivo spotify-player.js

1. Abre el archivo `spotify-player.js` en tu editor
2. Busca esta línea (aproximadamente al inicio):
   ```javascript
   const SPOTIFY_CONFIG = {
       clientId: 'TU_CLIENT_ID_AQUI',
   ```
3. Reemplaza `'TU_CLIENT_ID_AQUI'` con tu Client ID real, por ejemplo:
   ```javascript
   const SPOTIFY_CONFIG = {
       clientId: '1a2b3c4d5e6f7g8h9i0j',
   ```

4. **IMPORTANTE**: El `redirectUri` debe coincidir exactamente con donde está alojado tu sitio:
   - Para desarrollo local: `http://localhost:5500` o similar
   - Para producción: tu dominio real, por ejemplo: `https://tudominio.com`

### 4. Configurar el Redirect URI en Spotify

1. Vuelve al dashboard de Spotify
2. En tu app, haz clic en **"Edit Settings"**
3. Ve a **"Redirect URIs"**
4. Agrega tu URL local o de producción exactamente como está en `redirectUri` en el código
   - Para desarrollo: `http://localhost:5500/` (con trailing slash)
5. Guarda los cambios

### 5. ¡Listo!

Ahora el reproductor debería funcionar:
1. Abre tu sitio en el navegador
2. Verás el widget de Spotify en la esquina inferior derecha
3. Haz clic en **"Conectar"**
4. Se abrirá una ventana de login de Spotify
5. Autoriza la aplicación
6. ¡Disfruta reproduciendo música! 🎶

## Características del Reproductor

### Ubicación
- Fijo en la **esquina inferior derecha** de cualquier página
- Se adapta automáticamente en dispositivos móviles
- Siempre visible al navegar

### Funciones
- **Selector de Playlists**: Elige cualquier playlist de tu cuenta
- **Botones de Control**: Anterior, Reproducir/Pausar, Siguiente
- **Información en Vivo**: Muestra portada y nombre de la canción actual
- **Tema Adaptable**: Se ajusta automáticamente al modo claro/oscuro

### Persistencia
- La música continúa reproduciendo aunque cambies de página
- El token se guarda localmente para las próximas sesiones
- Puedes desconectar en cualquier momento

## Solución de Problemas

### "Sin dispositivos - Abre Spotify"
**Solución**: La API de Spotify necesita un dispositivo activo donde enviar la música.
1. Abre Spotify en tu computadora (app o web en open.spotify.com)
2. Asegúrate de que está reproduciendo algo o en pausa
3. Vuelve al sitio web y recarga la página
4. El reproductor debería detectar el dispositivo automáticamente

### "No aparece el botón de Conectar"
- Verifica que el `clientId` esté correcto en `spotify-player.js`
- Revisa la consola del navegador (F12 > Console) para ver mensajes de error

### "Error al conectar"
- Asegúrate de que el `redirectUri` en el código coincide exactamente con lo configurado en Spotify
- Los URIs deben tener http:// o https:// y el trailing slash
- Prueba agregar `/index.html` al final si no funciona sin él

### "La música no se reproduce"
- Spotify requiere una conexión activa. El dispositivo donde está tu navegador debe estar configurado en Spotify
- Asegúrate de tener una sesión activa de Spotify en algún dispositivo
- Verifica los permisos otorgados en la autorización
- **IMPORTANTE**: Abre Spotify en la web (open.spotify.com) o descarga la app para que sea un dispositivo válido

### "El reproductor no aparece"
- Abre la consola (F12) y busca errores
- Verifica que `spotify-player.js` esté en la misma carpeta que tus HTML

### "Dice 'Token expirado'"
- Los tokens de Spotify expiran después de 1 hora
- Simplemente haz clic en "Desconectar" y luego en "Conectar" nuevamente
- Se guardará tu sesión por defecto

## Documentación Oficial

Para más información sobre la Spotify Web API:
- https://developer.spotify.com/documentation/web-api/

## Notas de Seguridad

⚠️ **IMPORTANTE**: 
- Nunca compartas tu Client Secret (si aparece) en repositorios públicos
- Este código usa solo el Client ID, que es seguro compartir
- La autenticación se realiza directamente con Spotify mediante OAuth 2.0

---

¡Disfruta del reproductor! 🎵
