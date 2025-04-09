# Authentication API Examples

## User Registration
**Endpoint:** POST `/api/auth/register`

```json
{
    "nombre": "Jane Doe",
    "correo": "jane.doe@example.com",
    "contrasena": "SecurePassword123!"
}
```
## Create Project
**Endpoint:** POST `/api/projects`
```json
{
    "nombre_proyecto": "New Project",
    "descripcion": "Description of the new project",
    "fecha_fin": "2023-12-31T23:59:59"
}
```
## Update Password
**Endpoint:** PUT `/api/auth/update-password`
```Frontend Api Request**

    curl -X POST http://localhost:3000/api/users/change-password \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjAwOSwicm9sZXMiOltdLCJpYXQiOjE3NDQxNjIzNDIsImV4cCI6MTc0NDI0ODc0Mn0.9NZIjSXtMYxjHPwo6gcMjBCeMnih24eh2lbUFA-o-oE" \
    -d '{
        "contrasena_actual": "SecurePassword123!",
        "nueva_contrasena": "NewSecurePassword123!"
    }';  
```