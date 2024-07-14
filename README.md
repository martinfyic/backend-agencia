# Backend Agencia

## Descripción

Esto es un desarrollo de prueba para un backend de una agencia de excursiones que deberá contar con los requerimientos de gestión de usuarios y de sus respectivos productos, asi como el manejo de compras de los productos mediante paypal o mercadopagos.

### Gestión de usuarios

- Registro de usuarios
  - Registro custom mediante email y password
  - (Opcional) Registro mediante providers: Google, Facebook
- Autenticación
  - Custom login
  - (Opcional) Mediante providers: Google, Facebook
- Autorización basado en roles
  - ADMIN
  - USER
  - SELLER

### Productos

- Control de excursiones (CRUD)

### Ordenes

- Gestión de ordenes pendientes, pagas y canceladas

### Medios de pagos

- PayPal
- Mercadopagos

### Creación de reportes (Opcional)

- Ventas:
  - Destinos más comprados.
  - Ventas totales
    - Anual y mensual
- Usuarios

## Desarrollo

1- Clonar repositorio

```bash
git clone https://github.com/martinfyic/backend-agencia.git
```

2- Dirigirse al directorio de proyecto descargado:

```bash
cd backend-agencia/
```

3- Renombrar archivo [.env.template](./.env.template) por `.env` y completar las variables de entorno:

- `PORT`: number, ejemplo 3000
- `DB_PASSWORD`: string
- `DB_NAME`: string
- `JWT_SECRET`: string
- `DATABASE_URL`: string, ejemplo 'postgresql://postgres:password@localhost:5432/db_name?schema=public'

4- Ejecutar el comando:

```bash
docker compose up -d
```

5- Ejecutar el comando:

```bash
pnpm run start:dev
```
