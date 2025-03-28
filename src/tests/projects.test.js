const request = require('supertest');
const app = require('../app');
const { getConnection } = require('../config/db');

describe('Projects API', () => {
    let authToken;
    let testProjectId;

    beforeAll(async () => {
        // Login to get auth token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'testpassword'
            });
        
        authToken = loginResponse.body.token;
    });

    describe('POST /api/projects', () => {
        it('should create a new project', async () => {
            const newProject = {
                nombre_proyecto: 'Test Project',
                descripcion: 'Test Description',
                fecha_inicio: '2024-01-01',
                fecha_fin: '2024-12-31',
                participantes: [1] // Assuming user ID 1 exists
            };

            const response = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newProject);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.nombre_proyecto).toBe(newProject.nombre_proyecto);
            
            testProjectId = response.body.id;
        });
    });

    describe('GET /api/projects', () => {
        it('should get all projects', async () => {
            const response = await request(app)
                .get('/api/projects')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should get a specific project by ID', async () => {
            const response = await request(app)
                .get(`/api/projects/${testProjectId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(testProjectId);
        });
    });

    describe('PUT /api/projects/:id', () => {
        it('should update a project', async () => {
            const updatedProject = {
                nombre_proyecto: 'Updated Test Project',
                descripcion: 'Updated Description',
                fecha_inicio: '2024-01-01',
                fecha_fin: '2024-12-31'
            };

            const response = await request(app)
                .put(`/api/projects/${testProjectId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updatedProject);

            expect(response.status).toBe(200);
            expect(response.body.nombre_proyecto).toBe(updatedProject.nombre_proyecto);
        });
    });

    describe('POST /api/projects/:id/participants', () => {
        it('should add a participant to the project', async () => {
            const response = await request(app)
                .post(`/api/projects/${testProjectId}/participants`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ userId: 2 }); // Assuming user ID 2 exists

            expect(response.status).toBe(201);
        });
    });

    describe('DELETE /api/projects/:id/participants/:userId', () => {
        it('should remove a participant from the project', async () => {
            const response = await request(app)
                .delete(`/api/projects/${testProjectId}/participants/2`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });

    describe('DELETE /api/projects/:id', () => {
        it('should delete a project', async () => {
            const response = await request(app)
                .delete(`/api/projects/${testProjectId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });
});