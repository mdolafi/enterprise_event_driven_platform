const request = require('supertest');

// Mock Database Layer
jest.mock('../../config/db', () => {
    const mockStorage = new Map();

    return {
        query: jest.fn(async (text, params) => {
            const queryStr = typeof text === 'string' ? text.toUpperCase() : '';

            if (queryStr.includes('INSERT')) {
                const id = 'sub_1001a2b3-e29b-41d4-a716-446655440000';
                const record = {
                    id,
                    submission_id: id,
                    email: params ? params[0] : 'edward.kegan.ctr@dot.gov',
                    name: params ? params[1] : 'Edward Kegan',
                    title: params ? params[2] : '',
                    description: params ? params[3] : '',
                    priority: params ? params[4] : 'HIGH',
                    system_affected: params ? params[5] : 'marad_ccb_db'
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
                    id: id || 'sub_1001a2b3-e29b-41d4-a716-446655440000',
                    email: 'edward.kegan.ctr@dot.gov'
                };
                return { rows: [record] };
            }

            return { rows: [] };
        }),
        end: jest.fn(async () => Promise.resolve())
    };
});

const app = require('../../server');
const fixtureData = require('../../../tests/fixtures/submitter_fixture.json');

describe('Submitter Service Integration Tests', () => {
    let createdSubmitterId = 'sub_1001a2b3-e29b-41d4-a716-446655440000';

    describe('POST /api/v1/submitters', () => {
        it('should create a new submitter with a valid @dot.gov email', async () => {
            const response = await request(app)
                .post('/api/v1/submitters')
                .send(fixtureData.validSubmitter)
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.email).toMatch(/@dot\.gov$/);

            if (response.body && response.body.id) {
                createdSubmitterId = response.body.id;
            }
        });

        it('should return 400 Bad Request when non-@dot.gov domain is provided', async () => {
            const response = await request(app)
                .post('/api/v1/submitters')
                .send(fixtureData.invalidEmailSubmitter)
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/v1/submitters/:id', () => {
        it('should retrieve the created submitter by ID', async () => {
            const response = await request(app)
                .get(`/api/v1/submitters/${createdSubmitterId}`)
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(createdSubmitterId);
        });

        it('should return 404 when submitter ID does not exist', async () => {
            const response = await request(app)
                .get('/api/v1/submitters/00000000-0000-0000-0000-000000000000');

            expect(response.status).toBe(404);
        });
    });
});