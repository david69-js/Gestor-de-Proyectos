# Backend de Gestión de Productos

Backend de Gestión de Productos
Aplicación backend de Node.js para la gestión de productos con funciones que incluyen autenticación de usuarios, gestión de proyectos, seguimiento de tareas, manejo de archivos y notificaciones.

Requisitos
Node.js (v14 o superior)

Docker y Docker Compose

SQL Server (a través de Docker)

## Prerequisites

- Node.js (v14 or higher)
- Docker(Solo si estan en macOS) si no solo con sql server local
- SQL Server

## Instrucciones de configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd GestionProductosB
```

### 2. Configuración del entorno

Crea un archivo `.env` en el directorio raíz con las siguientes variables:

```env
DB_USER=sa
DB_PASSWORD=YourStrongPassword123
DB_SERVER=localhost
DB_DATABASE=GestionProductos
JWT_SECRET=YourSecretKey
PORT=3000
```
## Opción B: Conexión a una Instancia Local de SQL Server
Si prefieres conectarte a una instancia local de SQL Server sin usar Docker, asegúrate de tener SQL Server instalado y en ejecución en tu máquina. Luego, modifica las variables de entorno en el archivo .env según corresponda:

```env
DB_USER=sa
DB_PASSWORD=YourStrongPassword123
DB_SERVER=localhost
DB_DATABASE=GestionProductos
JWT_SECRET=YourSecretKey
PORT=3000
```

### 3. Database Setup

1. Start SQL Server container:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrongPassword123" \
   -p 1433:1433 --name sqlserver \
   -d mcr.microsoft.com/mssql/server:2019-latest
```

2. Initialize the database:
   - The database schema is located in `src/database/schema.sql`
   - Connect to the SQL Server and execute the schema file

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```


## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration

### Users
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Projects
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Create new project
- GET `/api/projects/:id` - Get project details
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create new task
- GET `/api/tasks/:id` - Get task details
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task

### Files
- POST `/api/files/project/:projectId` - Upload file to project
- GET `/api/files/project/:projectId` - Get project files
- GET `/api/files/:fileId` - Download file
- DELETE `/api/files/:fileId` - Delete file

### Notifications
- GET `/api/notifications/user/:userId` - Get user notifications
- POST `/api/notifications` - Create notification
- PUT `/api/notifications/:id/read` - Mark notification as read
- DELETE `/api/notifications/:id` - Delete notification

## Security

- All API endpoints (except authentication) require a valid JWT token
- Files are stored securely with proper access controls
- Passwords are hashed before storage
- SQL injection prevention through parameterized queries

## Error Handling

The application includes comprehensive error handling:
- Input validation
- Database error handling
- File operation error handling
- Authentication/Authorization errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request