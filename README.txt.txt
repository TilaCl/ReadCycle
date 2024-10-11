## Proyecto ReadCycle

### Descripción
ReadCycle es un proyecto basado en Ionic, utilizando Angular como base y Firebase como backend. A continuación, se detallan los pasos necesarios para configurar y ejecutar el proyecto en otro ordenador.

### Requisitos
1. **Node.js** (v16 o superior) y **NPM** (instalado con Node.js) o **Yarn**
   - Descargar desde: https://nodejs.org/
   
2. **Ionic CLI**: Instala la CLI de Ionic globalmente con:
   npm install -g @ionic/cli

3. **Firebase CLI**: Si usas Firebase para el hosting u otros servicios, instala la CLI de Firebase globalmente:
   npm install -g firebase-tools

4. **Firebase Login**: Debes logear la cuenta que está asociada al proyecto
   npm firebase login

5. **Capacitor CLI**: Si necesitas usar Capacitor para funciones nativas, instala la CLI de Capacitor globalmente:
   npm install -g @capacitor/cli

### Instalación del Proyecto
1. **Clonar el repositorio**:
   git clone <URL_DEL_REPOSITORIO>
   cd readcycle

2. **Instalar las dependencias**:
   Para instalar todas las dependencias necesarias, ejecuta:
   - Usando NPM:
     npm install
   - Usando Yarn:
     yarn install

### Configuración de Firebase
Si estás utilizando Firebase, debes configurar el entorno de Firebase localmente. Para hacerlo, crea el archivo `src/environments/environment.ts` con el siguiente contenido (con tus credenciales de Firebase):

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID'
  }
};

### Ejecución del Proyecto
1. Para ejecutar el proyecto en modo desarrollo:
   ionic serve

   Esto iniciará un servidor local y abrirá tu aplicación en el navegador.

### Ejecución en Modo Producción    ¡IMPORTANTE! AUN NO EJECUTAR ESTO!!
1. Para construir la aplicación para producción:
   ionic build --prod
   Esto generará los archivos optimizados en la carpeta `www/`.

### Capacitor: Sincronización para Apps Nativas (Opcional)
Si planeas compilar la aplicación para iOS o Android utilizando Capacitor, sigue estos pasos después de construir el proyecto:

1. **Sincronizar Capacitor con Android**:
   ionic cap sync android

2. **Sincronizar Capacitor con iOS**:
   ionic cap sync ios

3. **Ejecutar la app en un emulador/dispositivo**:
   - Para Android:
     ionic cap run android
   - Para iOS:
     ionic cap run ios

### Ejecutar Pruebas
1. **Pruebas unitarias**:
   npm test

2. **Pruebas E2E**:
   npm run e2e

### Detalles de la Configuración del Proyecto
El proyecto está configurado con Angular y utiliza SCSS como preprocesador de CSS. Los archivos SCSS globales están en las rutas:
- `src/global.scss`
- `src/theme/variables.scss`

La estructura básica del proyecto se encuentra definida en el archivo `angular.json`, con las siguientes configuraciones clave:
- **Modo Producción**: Se generan los archivos en la carpeta `www/`.
- **Modo Desarrollo**: Optimización deshabilitada para un desarrollo más rápido.
- **Linting**: Usa Angular ESLint para la validación del código.

---

### Dependencias principales
- **Angular**: v18.0.0
- **Ionic**: v8.3.2
- **Firebase**: v18.0.1
- **UUID**: v10.0.0
- **RxJS**: v7.8.0

### Dependencias de Desarrollo
- **Angular CLI**: v18.0.0
- **Capacitor CLI**: v6.1.2
- **TypeScript**: v5.4.0
- **ESLint**: v8.57.0
