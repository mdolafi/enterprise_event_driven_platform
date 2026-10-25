const request = require('supertest');

// Mock Database Layer
jest.mock('../../config/db', () => {
    const mockStorage = new Map();

    return {
        query: jest.fn(async (text, params) => {
            const queryStr = typeof text === 'string' ? text.toUpperCase() : '';

            if (queryStr.includes('INSERT')) {
                const id = 'usr_9921a8f-e29b-41d4-a716-446655440000';
                const record = {
                    id,
                    user_id: id,
                    name: params ? params[0] : 'Mohammed Dolafi',
                    user_name: params ? params[0] : 'Mohammed Dolafi',
                    email: params ? params[1] : 'mohammed.dolafi.ctr@dot.gov',
                    user_email_address: params ? params[1] : 'mohammed.dolafi.ctr@dot.gov',
                    role: params ? params[2] : 'ADMIN',
                    is_active: true
                };
                mockStorage.set(id, record);
                return { rows: [record] };
            }

            if (queryStr.includes('SELECT')) {
                const id = params ? params[0] : null;
                if (id === '00000000-0000-0000-0000-000000000000') {
                    return { rows: [] };
                }
                const record = mockStorage.get(id) || {
                    id: id || 'usr_9921a8f-e29b-41d4-a716-446655440000',
                    user_id: id || 'usr_9921a8f-e29b-41d4-a716-446655440000',
                    name: 'Mohammed Dolafi',
                    email: 'mohammed.dolafi.ctr@dot.gov',
                    role: 'ADMIN'
                };
                return { rows: [record] };
            }

            if (queryStr.includes('UPDATE')) {
                const id = params ? params[3] || params[0] : null;
                const role = params ? params[1] : 'INVESTIGATOR';
                const record = {
                    id: id || 'usr_9921a8f-e29b-41d4-a716-446655440000',
                    user_id: id || 'usr_9921a8f-e29b-41d4-a716-446655440000',
                    name: 'Mohammed Dolafi',
                    email: 'mohammed.dolafi.ctr@dot.gov',
                    role: role || 'INVESTIGATOR',
                    is_active: true
                };
                mockStorage.set(record.id, record);
                return { rows: [record] };
            }

            return { rows: [] };
        }),
        end: jest.fn(async () => Promise.resolve())
    };
});

const app = require('../../server');
const fixtureData = require('../../../tests/fixtures/user_fixture.json');

describe('User Service - Integration Tests', () => {
    let createdUserId = 'usr_9921a8f-e29b-41d4-a716-446655440000';

    describe('POST /api/v1/users', () => {
        it('should create a new user with valid @dot.gov email and return 201', async () => {
            const response = await request(app)
                .post('/api/v1/users')
                .send(fixtureData.validUser)
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.email).toMatch(/@dot\.gov$/);
            expect(response.body.name).toBe(fixtureData.validUser.name);

            if (response.body && response.body.id) {
                createdUserId = response.body.id;
            }
        });

        it('should return 400 Bad Request when non-@dot.gov email domain is supplied', async () => {
            const response = await request(app)
                .post('/api/v1/users')
                .send(fixtureData.invalidEmailUser)
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 Bad Request when required body fields are missing', async () => {
            const response = await request(app)
                .post('/api/v1/users')
                .send({ email: 'incomplete@dot.gov' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/users/:id', () => {
        it('should fetch an existing user by ID and return 200', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${createdUserId}`)
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(createdUserId);
            expect(response.body.email).toBe(fixtureData.validUser.email);
        });

        it('should return 404 Not Found for non-existent user ID', async () => {
            const response = await request(app)
                .get('/api/v1/users/00000000-0000-0000-0000-000000000000')
                .set('Accept', 'application/json');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/v1/users/:id', () => {
        it('should update user details and return 200', async () => {
            const response = await request(app)
                .put(`/api/v1/users/${createdUserId}`)
                .send(fixtureData.updateUser)
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.role).toBe(fixtureData.updateUser.role);
        });

        it('should return 403 Forbidden when attempting to update protected fields or assign an unauthorized role', async () => {
            const response = await request(app)
                .put(`/api/v1/users/${createdUserId}`)
                .send({ role: 'super_admin_unauthorized' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(403);
        });
    });
});