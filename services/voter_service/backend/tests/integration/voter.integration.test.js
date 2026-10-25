const request = require('supertest');

// Mock Database Layer
jest.mock('../../config/db', () => {
    const mockStorage = new Map();

    return {
        query: jest.fn(async (text, params) => {
            const queryStr = typeof text === 'string' ? text.toUpperCase() : '';

            if (queryStr.includes('INSERT')) {
                const id = 'vtr_5501b8c2-e29b-41d4-a716-446655440000';
                const record = {
                    id,
                    vote_id: id,
                    email: params ? params[0] : 'andre.gordon@dot.gov',
                    voter_email: params ? params[0] : 'andre.gordon@dot.gov',
                    name: params ? params[1] : 'Andre Gordon',
                    role: 'VOTER'
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
                    id: id || 'vtr_5501b8c2-e29b-41d4-a716-446655440000',
                    vote_id: id || 'vtr_5501b8c2-e29b-41d4-a716-446655440000',
                    email: 'andre.gordon@dot.gov',
                    name: 'Andre Gordon',
                    role: 'VOTER'
                };
                return { rows: [record] };
            }

            return { rows: [] };
        }),
        end: jest.fn(async () => Promise.resolve())
    };
});

const app = require('../../server');
const fixtureData = require('../../../tests/fixtures/voter_fixture.json');

describe('Voter Service - Integration Tests', () => {
    let createdVoterId = 'vtr_5501b8c2-e29b-41d4-a716-446655440000';

    describe('POST /api/v1/voters', () => {
        it('should register a CCB voting member with valid @dot.gov credentials', async () => {
            const response = await request(app)
                .post('/api/v1/voters')
                .send(fixtureData.validVoter)
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.email).toMatch(/@dot\.gov$/);

            if (response.body && response.body.id) {
                createdVoterId = response.body.id;
            }
        });

        it('should return 400 Bad Request if voter email is not on @dot.gov domain', async () => {
            const response = await request(app)
                .post('/api/v1/voters')
                .send(fixtureData.invalidVoter)
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/voters/:id', () => {
        it('should retrieve voter member profile by ID', async () => {
            const response = await request(app)
                .get(`/api/v1/voters/${createdVoterId}`)
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(createdVoterId);
        });

        it('should return 404 Not Found for non-existent voter ID', async () => {
            const response = await request(app)
                .get('/api/v1/voters/00000000-0000-0000-0000-000000000000');

            expect(response.status).toBe(404);
        });
    });
});