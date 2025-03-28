# Product Management Backend

A Node.js backend application for product management with features including user authentication, project management, task tracking, file handling, and notifications.

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- SQL Server (via Docker)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GestionProductosB
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

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

The server will start on the port specified in your .env file (default: 3000).

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