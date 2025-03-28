const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
    let authToken;

    beforeAll(async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'testpassword'
            });

        authToken = response.body.token;
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'testpassword'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        it('should fail with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/auth/profile', () => {
        it('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('nombre');
            expect(response.body).toHaveProperty('correo');
        });

        it('should fail without authentication token', async () => {
            const response = await request(app)
                .get('/api/auth/profile');

            expect(response.status).toBe(401);
        });
    });
});