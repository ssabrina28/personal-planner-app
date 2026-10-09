# personal-planner-app

Aplicación personal planner con login, organización por usuario y tema claro/oscuro adaptable a mobile.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + JWT
- Base de datos: MongoDB
- Diseño: CSS moderno, mobile-first, tema claro / oscuro

## Requisitos

- Node.js 18+
- MongoDB local o Atlas
- npm

## Configuración rápida

1. Clona el proyecto y entra a la carpeta.
2. Crea un archivo `.env` en `backend` con:

```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/personal-planner
JWT_SECRET=tu_secreto_super_seguro
CLIENT_URL=http://localhost:5173
```

3. Inicia MongoDB.
4. Instala dependencias:

```bash
cd backend && npm install
cd ../frontend && npm install
```

5. Inicia la API y la app:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

6. Abre `http://localhost:5173`.

## Funcionalidades

- Registro e inicio de sesión
- Cada usuario maneja su propia agenda
- Registro de tareas, eventos, notas y finanzas
- Tema claro y oscuro
- Diseño responsive para móvil
- Resumen del día y del mes

## Estructura

```text
backend/
  src/
    config/
    middleware/
    models/
    routes/
    server.js
frontend/
  src/
    components/
    context/
    pages/
    App.jsx
    main.jsx
    index.css
```
