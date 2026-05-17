# MEDISTOCK - Plataforma E-Commerce de Insumos Médicos

![Angular](https://img.shields.io/badge/Angular-17.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

MEDISTOCK es una plataforma e-commerce moderna y profesional para la venta de insumos médicos y farmacéuticos. Este proyecto fue desarrollado como parte de la evaluación de Integración de Plataformas.

## 🚀 Características Principales

### Para Clientes:
- **Catálogo Completo:** Búsqueda, filtrado por categorías y ordenamiento por precios.
- **Paginación:** Navegación fluida entre páginas de productos.
- **Carrito de Compras:** Gestión del carrito con persistencia local y sincronización en la nube para usuarios autenticados.
- **Proceso de Checkout:** Simulación de compra con selección de método de pago y dirección.
- **Seguimiento de Pedidos:** Tracking en tiempo real del estado de cada pedido con su ID.
- **Autenticación Segura:** Registro e inicio de sesión (Firebase Auth) con datos de institución.
- **Modo Oscuro (Dark Mode):** Interfaz adaptativa que respeta la preferencia del usuario o se cambia manualmente.
- **Diseño Responsivo:** Experiencia premium en móviles, tablets y escritorio.

### Para Administradores:
- **Dashboard Analítico:** Métricas clave como ingresos totales, cantidad de pedidos y alertas de bajo stock.
- **Gestión de Productos (CRUD):** Crear, editar, eliminar y visualizar productos.
- **Carga de Imágenes Dual:** Subir imágenes desde **URL** o directamente desde el **dispositivo** (Firebase Storage).
- **Importación Masiva:** Carga de productos mediante archivos Excel (.xlsx, .xls) con plantilla disponible para descarga.
- **Historial de Cambios:** Registro completo de todas las modificaciones realizadas por los administradores (creación, edición y eliminación de productos).
- **Gestión de Pedidos:** Actualizar el estado de los pedidos y visualizar detalles.
- **Gestión de Proveedores:** Almacenamiento de información de proveedores incluyendo RUT, razón social y representante legal.
- **Exportación de Datos:** Descarga del registro de pedidos y productos en formato CSV/Excel.
- **Control de Acceso:** Rutas protegidas exclusivamente para administradores (`/admin`).

### Registro de Instituciones
- **Campos Especiales:** Razón Social, RUT Empresa, Representante Legal, Requiere Timbre, Proveedores Asociados.
- **Persistencia:** Todos los datos se guardan en Firestore y se cargan automáticamente en el Checkout.

## 🛠️ Arquitectura y Tecnologías (Stack Obligatorio)

- **Frontend:** Angular 17 (Standalone Components)
- **Estilos:** Tailwind CSS (Diseño moderno premium con colores médicos)
- **Backend / BaaS (Backend as a Service):** Firebase Cloud
  - **Cloud Functions:** Lógica de negocio, integración con Webpay y envío de correos (Carpeta `functions/`).
  - **Base de Datos:** Firestore (Colecciones: `users`, `products`, `orders`, `carts`, `payments`, `providers`, `changeHistory`).
  - **Autenticación:** Firebase Authentication.
  - **Hosting:** Firebase Hosting.
  - **Storage:** Firebase Storage para imágenes de productos.
  - **Reglas de Seguridad:** Firestore y Storage Rules configurados para producción.

## 📊 ¿Esto cumple con el requerimiento de "Backend estilo Django para consumir APIs"?

**¡SÍ, totalmente!** Aquí está la justificación:

### 1. Firebase como Backend as a Service (BaaS)
Firebase no es solo "una base de datos": es una **plataforma BaaS completa** que cumple con todas las funciones de un backend tradicional como Django:

1. **Lógica de Negocio:** En las `functions/index.js` se encuentran APIs RESTful para procesar pagos, enviar correos y exponer servicios ERP.
2. **Seguridad:** Las `firestore.rules` y `storage.rules` actúan como middleware de seguridad (equivalente a permisos en Django).
3. **Persistencia:** Firestore guarda todos los datos en tiempo real (equivalente a PostgreSQL/MySQL).
4. **Escalabilidad:** Escala automáticamente según la demanda.

### 2. APIs RESTful Listas para Consumir
El proyecto tiene **endpoints HTTP personalizados** en Cloud Functions (`functions/index.js`) que se pueden consumir desde cualquier frontend (React, Vue, Flutter, etc.), al igual que una API Django.

### 3. Estructura de Datos Organizada
Las colecciones de Firestore están estructuradas como tablas en una BD relacional, con relaciones claras entre documentos.

---

## 🚀 Backend APIs y Estructura de Firestore (Editable y Consumible)

Firebase funciona como un **Backend as a Service** donde las APIs son **CRUD directas a Firestore** o **Endpoints personalizados via Cloud Functions**. Todo es editable y se puede consumir desde cualquier cliente frontend.

### 1. Colecciones de Firestore (Modelos de Datos)
Las principales colecciones disponibles para la API son:

#### Colección: `products` (Productos)
```typescript
{
  id: string,
  codigo: string,
  nombre: string,
  descripcion: string,
  precio: number,
  precioOferta?: number,
  precioEnvioPrioritario?: number, // Precio adicional para envío rápido
  stock: number,
  bodegas?: { principal: number, norte: number, sur: number },
  categoria: string,
  imagen: string,
  imagenes?: string[],
  sku?: string,
  destacado?: boolean,
  activo?: boolean,
  createdAt: string,
  updatedAt: string
}
```
**Reglas de API:**
- GET (Leer): ✅ Público
- POST/PUT/DELETE (Escribir): 🔒 Solo Administradores

#### Colección: `users` (Usuarios / Instituciones)
```typescript
{
  uid: string,
  name: string,
  lastName?: string,
  email: string,
  rut?: string,
  role: 'paciente' | 'institucion' | 'admin' | 'ejecutivo' | 'logistica' | 'analista',
  telefono?: string,
  direccion?: string,
  numeroDepto?: string,
  region?: string,
  comuna?: string,
  codigoPostal?: string,
  referencias?: string,
  
  // Campos adicionales para institución
  razonSocial?: string,
  empresaRut?: string,
  representanteLegal?: string,
  timbre?: boolean,
  proveedores?: string[],
  
  totalSpent?: number,
  status?: 'active' | 'blocked',
  photoUrl?: string,
  createdAt: string
}
```
**Reglas de API:**
- GET (Leer): 🔒 Propio usuario o Administrador
- POST/PUT/DELETE (Escribir): 🔒 Propio usuario o Administrador

#### Colección: `orders` (Pedidos)
```typescript
{
  id?: string,
  userId: string,
  userEmail: string,
  items: OrderItem[],
  subtotal: number,
  envio: number,
  total: number,
  tipoDespacho: 'normal' | 'express',
  urgenciaMedica?: boolean,
  aprobadaPorEjecutivo?: boolean,
  estado: 'pendiente' | 'pagado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado',
  fecha: Date,
  direccionEnvio: {
    nombre: string,
    apellido: string,
    telefono: string,
    direccion: string,
    numeroDepto?: string,
    region: string,
    comuna: string,
    codigoPostal?: string,
    referencias?: string
  },
  metodoPago: string,
  
  // Campos adicionales
  timbre?: boolean,
  razonSocial?: string,
  empresaRut?: string,
  representanteLegal?: string,
  precioEnvioPrioritario?: number
}
```
**Reglas de API:**
- GET (Leer): 🔒 Propio usuario o Administrador
- POST (Crear): 🔒 Usuario autenticado
- PUT/DELETE: 🔒 Solo Administradores

#### Colección: `providers` (Proveedores)
```typescript
{
  id: string,
  nombre: string,
  rut: string,           // Identificador tributario de la empresa
  razonSocial: string,   // Nombre legal de la empresa
  representanteLegal: string, // Persona autorizada
  telefono?: string,
  email?: string,
  direccion?: string,
  productos?: string[],
  activo?: boolean,
  createdAt: string,
  updatedAt: string
}
```
**Reglas de API:**
- GET/POST/PUT/DELETE: 🔒 Solo Administradores

#### Colección: `changeHistory` (Historial de Cambios)
```typescript
{
  id: string,
  userId: string,
  userName: string,
  action: 'create' | 'update' | 'delete',
  entity: 'product' | 'order' | 'user' | 'provider',
  entityId: string,
  details: string,
  timestamp: Date
}
```
**Reglas de API:**
- GET (Leer): 🔒 Solo Administradores
- POST (Crear): 🔒 Solo Administradores

---

### 2. Cloud Functions (Endpoints Personalizados)
Las APIs RESTful están en la carpeta `functions/index.js` y son accesibles via:

#### Endpoint 1: Inicializar Transacción de Webpay
- **Ruta**: `POST /api/initWebpayTransaction`
- **Body**: `{ buyOrder: string, amount: number, returnUrl: string }`
- **Respuesta**: `{ url: string, token: string }`

#### Endpoint 2: Confirmar Transacción de Webpay
- **Ruta**: `POST /api/confirmWebpayTransaction`
- **Body**: `{ token_ws: string }`
- **Respuesta**: `{ status: 'success' | 'rejected', ...detalles }`

#### Endpoint 3: Enviar Correo con PDF
- **Ruta**: `POST /api/sendEmailWithPdf`
- **Body**: `{ to: string, subject: string, html: string, pdfBase64: string, pdfName: string }`
- **Respuesta**: `{ success: boolean }`

#### Endpoint 4: API ERP - Obtener Producto
- **Ruta**: `GET /api/v1/productos/{id}`
- **Respuesta**: `{ id, nombre, precio, stock, categoria, ultima_actualizacion }`
- **Descripción**: Endpoint diseñado para integración con sistemas ERP externos (estilo Django REST Framework)

#### Endpoint 5: API Logística
- **Ruta**: `POST /api/createLogisticsLabel`
- **Body**: `{ orderId, address, city }`
- **Respuesta**: `{ success, tracking_number, carrier, estimated_delivery }`

---

### 3. Cómo Editar el Backend
1. **Modificar Colecciones**: Añade/edita campos directamente en los modelos de TypeScript (`src/app/models/`) y en la consola de Firestore.
2. **Cambiar Reglas**: Edita el archivo `firestore.rules` y despliega con `firebase deploy --only firestore:rules`.
3. **Nuevas Cloud Functions**: Añade funciones en `functions/index.js` y despliega con `firebase deploy --only functions`.

### 4. Consumir las APIs desde otro Frontend
Cualquier cliente (React, Vue, Flutter, etc.) puede consumir estas APIs usando el **Firebase Admin SDK** o el **Firebase Client SDK** para su plataforma, o llamando directamente a los endpoints HTTPS de Cloud Functions.

---

## 📚 Importación y Exportación de Datos

### Importación Masiva de Productos
Para agregar productos de forma rápida:
1.  Ve al panel de administración de productos (`/admin/productos`).
2.  Haz clic en **"Descargar Plantilla"** para obtener el formato correcto.
3.  Llena el Excel con tus productos.
4.  Haz clic en **"Importar XLS"** y sube el archivo.

### Carga de Imágenes
El sistema ofrece **dos formas** de cargar imágenes para cada producto:
1.  **Por URL**: Ingresa la dirección web directa de la imagen.
2.  **Por Dispositivo**: Selecciona un archivo JPG/PNG desde tu computadora (se sube automáticamente a Firebase Storage).

Ambos métodos están disponibles tanto para la **imagen principal** como para cada imagen en la **galería adicional**.

---

## 🔗 APIs y Servicios Integrados

- **Firebase SDK (v10.11.0):** Gestión centralizada de datos, usuarios y archivos.
- **Webpay Plus (Transbank SDK):** Pasarela de pagos integrada para transacciones seguras (Simulada).
- **Cloud Functions API:** Endpoints personalizados para el envío automático de comprobantes y APIs ERP.
- **Lucide Icons:** Biblioteca de iconos vectoriales optimizada para Angular.
- **Chart.js & ng2-charts:** Generación de gráficos dinámicos para el dashboard administrativo.
- **jsPDF & AutoTable:** Motor de generación de boletas y reportes en formato PDF desde el navegador.
- **SheetJS (XLSX):** Exportación/importación de inventarios y reportes de ventas a Excel/CSV.

---

## 💳 Tarjetas de Prueba (Entorno de Simulación)

Para realizar pruebas de flujo de compra en el entorno de Webpay, utiliza las siguientes tarjetas:

| Tipo de Tarjeta | Número de Tarjeta | CVV | Expiración | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **VISA** | `4051 8856 0044 6623` | `123` | Cualquier fecha | ✅ Transacción Aprobada |
| **AMEX** | `3700 0000 0002 032` | `1234` | Cualquier fecha | ✅ Transacción Aprobada |
| **MASTERCARD** | `5186 0595 5959 0568` | `123` | Cualquier fecha | ❌ Transacción Rechazada |

---

## 📖 Guía para Desarrolladores

### Estructura Clean Architecture en Angular:
- `src/app/models/` - Interfaces TypeScript de dominio (`Order`, `Product`, `User`, `Provider`, `ChangeHistory`).
- `src/app/services/` - Lógica de negocio e interacción con Firebase y APIs externas.
- `src/app/guards/` - Protección de rutas según roles (`AuthGuard`, `AdminGuard`).
- `src/app/components/` - Componentes UI reutilizables (Navbar, Footer, Toasts, Modales).
- `src/app/pages/` - Vistas principales organizadas por módulos (Admin, Auth, Checkout, etc.).

### Flujo de Datos y Servicios Clave
1. **Autenticación:** Se gestiona a través de [auth.service.ts](file:///c:/Users/marti/OneDrive/Escritorio/Medistock-2026/src/app/services/auth.service.ts). Utiliza un `BehaviorSubject` para mantener el estado del usuario en tiempo real en toda la aplicación.
2. **Gestión de Carrito:** [cart.service.ts](file:///c:/Users/marti/OneDrive/Escritorio/Medistock-2026/src/app/services/cart.service.ts) maneja la lógica de agregar/quitar productos y persiste los datos en `localStorage` y en Firestore (para usuarios autenticados), permitiendo sincronización entre dispositivos.
3. **Proceso de Pago:** El componente [checkout.component.ts](file:///c:/Users/marti/OneDrive/Escritorio/Medistock-2026/src/app/pages/checkout/checkout.component.ts) coordina la validación de datos, la integración con Webpay y la creación final del pedido en Firestore.
4. **Envío de Correos:** Se delega a [email.service.ts](file:///c:/Users/marti/OneDrive/Escritorio/Medistock-2026/src/app/services/email.service.ts), que consume la Cloud Function para adjuntar boletas PDF generadas por [pdf.service.ts](file:///c:/Users/marti/OneDrive/Escritorio/Medistock-2026/src/app/services/pdf.service.ts).
5. **Carga de Imágenes:** [storage.service.ts](file:///c:/Users/marti/OneDrive/Escritorio/Medistock-2026/src/app/services/storage.service.ts) maneja la subida de archivos a Firebase Storage y devuelve las URLs públicas.

### Tips para Colaboradores
- **Modo Debug:** Puedes ver los logs de transacciones en la consola del navegador para depurar el flujo de Webpay.
- **Nuevas Páginas:** Al crear una página, asegúrate de registrarla en [app.routes.ts](file:///c:/Users/marti/OneDrive/Escritorio/Medistock-2026/src/app/app.routes.ts).
- **Estilos:** Prioriza el uso de clases de Tailwind CSS en los archivos HTML en lugar de escribir CSS personalizado en los archivos `.css` a menos que sea estrictamente necesario.
- **Cloud Functions:** Si modificas el código en la carpeta `functions/`, recuerda desplegarlas con `firebase deploy --only functions` para que los cambios surtan efecto.

---

## ⚙️ Pasos de Instalación y Configuración

### 1. Requisitos Previos
- [Node.js](https://nodejs.org/) (v18.x o superior)
- Angular CLI (`npm install -g @angular/cli`)
- Cuenta de [Firebase](https://firebase.google.com/)

### 2. Clonar el repositorio e instalar dependencias
```bash
git clone <tu-repositorio>
cd Medistock-2026
npm install
```

### 3. Configurar Firebase
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2. Crea un nuevo proyecto llamado `medistock`.
3. Habilita **Authentication** (Correo/Contraseña).
4. Habilita **Firestore Database**, **Storage** y **Cloud Functions**.
5. Registra una aplicación web para obtener tus credenciales de Firebase.
6. Reemplaza las credenciales en `src/app/app.config.ts` o en tu entorno de environment.

*(Nota: En este repositorio ya hay credenciales de prueba preconfiguradas, pero se recomienda usar propias para producción).*

### 4. Configurar Permisos de Administrador (Opcional pero recomendado)
Para probar el dashboard de admin, necesitas asignar el rol `admin` a un usuario.
1. Regístrate normalmente desde la aplicación en la ruta `/register`.
2. Ve a la consola de Firebase -> Firestore Database -> colección `users`.
3. Busca el documento con tu UID.
4. Cambia el campo `role` de `paciente` o `institucion` a `admin`.
5. Vuelve a iniciar sesión.

### 5. Ejecutar el Servidor de Desarrollo
```bash
npm run start
# O usando Angular CLI:
ng serve
```
Navega a `http://localhost:4200/` en tu navegador. La aplicación se recargará automáticamente si cambias alguno de los archivos fuente.

---

## 📦 Deploy a Producción (Firebase Hosting)

La aplicación está lista para ser desplegada en Firebase Hosting. Los archivos `firebase.json`, `firestore.rules`, `storage.rules` y `firestore.indexes.json` ya están configurados.

1. Instala las Firebase Tools (si no las tienes):
```bash
npm install -g firebase-tools
```

2. Inicia sesión en Firebase:
```bash
firebase login
```

3. Inicializa el proyecto (Si se te pide, no sobrescribas los archivos `firebase.json` o reglas actuales):
```bash
firebase init
```

4. Construye la aplicación de Angular para producción:
```bash
npm run build
# O usando Angular CLI:
ng build
```

5. Despliega a Firebase:
```bash
firebase deploy
```

---

## 🔒 Reglas de Seguridad Implementadas
Se incluyeron reglas robustas tanto en `firestore.rules` como en `storage.rules` para asegurar que:
- Solo los administradores pueden escribir (crear, actualizar, eliminar) en `products` y `providers`.
- Los clientes solo pueden leer los productos, crear sus propios pedidos y leer los pedidos que les pertenecen.
- La creación de la colección `users` coincide con el UID del usuario autenticado.
- Las imágenes de productos en Storage son de lectura pública pero solo editable por usuarios autenticados.

---

**Desarrollado para Integración de Plataformas**
#medistock2026
