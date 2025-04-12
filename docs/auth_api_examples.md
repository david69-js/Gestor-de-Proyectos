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
## User Login
**Endpoint:** POST `/api/auth/login`
```json
{
   "correo": "juanitoExp@example.com",
    "contrasena": "securePassword123"
}
```
## Change Password
**Endpoint:** PUT `/api/auth/change-password`
```json
{
    "contrasena_actual": "SecurePassword123!",
    "nueva_contrasena": "NewSecurePassword123!"
}
```
## Delete User
**Endpoint:** DELETE `/api/users/{userId}`
**Needs Authentication Token**
No request body is required for this rout

## Update User Profile
**Endpoint:** PUT `/api/auth/update-profile`
**Needs Authentication Token**
```json
{
    "nombre": "JuanitoExp2",
    "imagen_perfil": "path/to/profile/image.jpgad322",
    "numero_telefono": "123-456-7890",
    "fecha_nacimiento": "1990-01-01"
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