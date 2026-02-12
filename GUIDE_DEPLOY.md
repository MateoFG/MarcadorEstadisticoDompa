# Guía de Despliegue en Firebase Hosting

Para completar la configuración del despliegue automático con GitHub Actions, sigue estos pasos:

## 1. Obtener el ID del Proyecto de Firebase
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2. Selecciona tu proyecto.
3. Copia el **ID del proyecto**.

## 2. Actualizar configuración local
1. Abre el archivo `.firebaserc` en la raíz del proyecto.
2. Reemplaza `YOUR_FIREBASE_PROJECT_ID` con el ID que copiaste.
3. Abre el archivo `.github/workflows/deploy.yml`.
4. Reemplaza `YOUR_FIREBASE_PROJECT_ID` (línea ~16) con el ID real.

## 3. Configurar el Secreto en GitHub
Para que GitHub Actions pueda desplegar, necesita permisos.
1. En la consola de Firebase, ve a **Configuración del proyecto** > **Cuentas de servicio**.
2. Haz clic en **Generar nueva clave privada**. Se descargará un archivo JSON.
3. Abre ese archivo JSON y copia **todo su contenido**.
4. Ve a tu repositorio en GitHub (`https://github.com/MateoFG/MarcadorEstadisticoDompa`).
5. Ve a **Settings** > **Secrets and variables** > **Actions**.
6. Haz clic en **New repository secret**.
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Secret**: Pega el contenido del JSON.
7. Haz clic en **Add secret**.

## 4. Desplegar
Una vez configurado:
1. Haz un commit y push de los cambios en `.firebaserc` y `deploy.yml`.
   ```bash
   git add .
   git commit -m "Configurar Firebase Hosting"
   git push
   ```
2. Ve a la pestaña **Actions** en tu repositorio de GitHub para ver el despliegue en progreso.

## (Opcional) Despliegue Manual
Si prefieres desplegar manualmente desde tu ordenador:
1. Instala las herramientas de Firebase: `npm install -g firebase-tools`
2. Inicia sesión: `firebase login`
3. Despliega: `firebase deploy`
