const request = require('supertest');

// Mock Database Layer
jest.mock('../../config/db', () => {
    const mockStorage = new Map();

    return {
        query: jest.fn(async (text, params) => {
            const queryStr = typeof text === 'string' ? text.toUpperCase() : '';

            if (queryStr.includes('INSERT')) {
                const id = 'inv_7001a2b3-e29b-41d4-a716-446655440000';
                const record = {
                    id,
                    investigation_id: id,
                    proposal_id: params ? params[0] : 'ccb-2026-0042',
                    investigator_name: params ? params[1] : 'Michael Kim',
                    investigatorEmail: params ? params[2] : 'michael.kim@dot.gov',
                    findings: params ? params[3] : 'Initial findings',
                    status: params ? params[4] : 'INITIATED'
                };
                mockStorage.set(id, record);
                return { rows: [record] };
            }

            if (queryStr.includes('UPDATE')) {
                const id = params ? params[2] : 'inv_7001a2b3-e29b-41d4-a716-446655440000';
                const record = {
                    id,
                    investigation_id: id,
                    findings: params ? params[0] : 'Under active review',
                    status: params ? params[1] : 'IN_PROGRESS'
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
                    id: id || 'inv_7001a2b3-e29b-41d4-a716-446655440000',
                    investigation_id: id || 'inv_7001a2b3-e29b-41d4-a716-446655440000',
                    investigatorEmail: 'michael.kim@dot.gov',
                    status: 'IN_PROGRESS'
                };
                return { rows: [record] };
            }

            return { rows: [] };
        }),
        end: jest.fn(async () => Promise.resolve())
    };
});

const app = require('../../server');
const fixtureData = require('../../../tests/fixtures/investigation_fixture.json');

describe('Investigation Service - Integration Tests', () => {
    let createdInvestigationId = 'inv_7001a2b3-e29b-41d4-a716-446655440000';

    describe('POST /api/v1/investigations', () => {
        it('should initiate an investigation assigned to a valid @dot.gov investigator', async () => {
            const response = await request(app)
                .post('/api/v1/investigations')
                .send(fixtureData.validInvestigation)
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.investigatorEmail).toMatch(/@dot\.gov$/);

            if (response.body && response.body.id) {
                createdInvestigationId = response.body.id;
            }
        });

        it('should return 400 when assigned investigator has an invalid domain', async () => {
            const response = await request(app)
                .post('/api/v1/investigations')
                .send(fixtureData.invalidInvestigator)
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/v1/investigations/:id', () => {
        it('should update investigation status and return 200', async () => {
            const response = await request(app)
                .put(`/api/v1/investigations/${createdInvestigationId}`)
                .send({ status: 'IN_PROGRESS', summary: 'Under active review' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('IN_PROGRESS');
        });

        it('should return 403 Forbidden on unauthorized status transition attempt', async () => {
            const response = await request(app)
                .put(`/api/v1/investigations/${createdInvestigationId}`)
                .send({ status: 'CLOSED_UNAUTHORIZED_BYPASS' })
                .set('Accept', 'application/json');

            expect(response.status).toBe(403);
        });
    });
});