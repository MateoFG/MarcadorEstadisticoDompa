# Configuración de Variables de Entorno en Firebase App Hosting

## Variables Requeridas

Para que la aplicación funcione correctamente en producción, debes configurar las siguientes variables de entorno en el panel de Firebase App Hosting:

```
VITE_FIREBASE_API_KEY=AIzaSyB6e7IKiB2KIypEQVW3Gknzn79JDMN6A6w
VITE_FIREBASE_AUTH_DOMAIN=marcador4estadistico-293-f8d49.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=marcador4estadistico-293-f8d49
VITE_FIREBASE_STORAGE_BUCKET=marcador4estadistico-293-f8d49.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=822731688115
VITE_FIREBASE_APP_ID=1:822731688115:web:aaa3dfe8ad1ab107e6c8c6
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**IMPORTANTE**: Reemplaza `G-XXXXXXXXXX` con tu Measurement ID real de Google Analytics (si lo has configurado). Si no tienes Analytics configurado, puedes omitir esta variable.

## Pasos para Configurar en Firebase

### Opción 1: Firebase Console (UI)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `marcador4estadistico-293-f8d49`
3. En el menú lateral, busca **App Hosting** (bajo "Build" o "Deploy")
4. Selecciona tu backend `github20260212`
5. Ve a la pestaña **Settings** o **Configuration**
6. Busca la sección **Environment variables** o **Secret Manager**
7. Añade cada variable una por una con sus valores correspondientes
8. Guarda los cambios

### Opción 2: Firebase CLI (Recomendado)

Si tienes el Firebase CLI instalado, puedes configurar las variables desde la terminal:

```bash
# Asegúrate de estar autenticado
firebase login

# Ve al directorio del proyecto
cd /Users/mateo/Workspace_AG/CVSM_Dompa/MarcadorEstadisticoDompa

# Configura cada variable
firebase apphosting:secrets:set VITE_FIREBASE_API_KEY
firebase apphosting:secrets:set VITE_FIREBASE_AUTH_DOMAIN
firebase apphosting:secrets:set VITE_FIREBASE_PROJECT_ID
firebase apphosting:secrets:set VITE_FIREBASE_STORAGE_BUCKET
firebase apphosting:secrets:set VITE_FIREBASE_MESSAGING_SENDER_ID
firebase apphosting:secrets:set VITE_FIREBASE_APP_ID
firebase apphosting:secrets:set VITE_FIREBASE_MEASUREMENT_ID
```

Cada comando te pedirá que introduzcas el valor correspondiente.

## Verificación

Después de configurar las variables:

1. Ve a la pestaña **Rollouts** en Firebase App Hosting
2. Haz clic en **Create new rollout** o espera a que se detecte el siguiente commit
3. Firebase compilará la aplicación con las nuevas variables
4. Una vez completado el despliegue, visita https://www.marcador.dompavolei.com/
5. Abre la consola del navegador (F12) y verifica que no haya errores de Firebase

## Diagnóstico de Errores

Si ves errores en la consola del navegador:

- **"Firebase App not initialized"**: Las variables de entorno no están configuradas correctamente
- **"Missing API key"**: Falta la variable `VITE_FIREBASE_API_KEY`
- **"Project ID not found"**: Falta la variable `VITE_FIREBASE_PROJECT_ID`

## Notas de Seguridad

- Estas variables son **públicas** y están diseñadas para ser expuestas en el cliente
- Firebase controla el acceso mediante **reglas de seguridad** en Firestore/Storage
- No confundas estas con el **Service Account JSON** que es privado y solo se usa en GitHub Actions
