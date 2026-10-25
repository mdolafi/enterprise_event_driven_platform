const request = require('supertest');

// 1. Mock Database Layer (Targeting relative path backend/config/db.js)
jest.mock('../../config/db', () => {
    const mockStorage = new Map();

    return {
        query: jest.fn(async (text, params) => {
            const queryStr = typeof text === 'string' ? text.toUpperCase() : '';

            if (queryStr.includes('INSERT')) {
                const id = '550e8400-e29b-41d4-a716-446655440000';
                const record = {
                    id,
                    decision_id: id,
                    decision_maker_name: params ? params[0] : 'Chairperson Smith',
                    proposal_id: params ? params[1] : 'ccb-2026-0042',
                    final_decision: params ? params[2] : 'APPROVED',
                    notes: params ? params[3] : 'Approved unanimously',
                    approverEmail: params ? params[4] : 'chairperson@dot.gov'
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
                    id: id || '550e8400-e29b-41d4-a716-446655440000',
                    decision_id: id || '550e8400-e29b-41d4-a716-446655440000',
                    decision_maker_name: 'Chairperson Smith',
                    proposal_id: 'ccb-2026-0042',
                    final_decision: 'APPROVED',
                    approverEmail: 'chairperson@dot.gov'
                };
                return { rows: [record] };
            }

            return { rows: [] };
        }),
        end: jest.fn(async () => Promise.resolve())
    };
});

const app = require('../../server');
const fixtureData = require('../../../tests/fixtures/decision_fixture.json');

describe('Decision Maker Service - Integration Tests', () => {
    let createdDecisionId = '550e8400-e29b-41d4-a716-446655440000';

    describe('POST /api/v1/decision_makers', () => {
        it('should record a CCB decision with a valid decision maker @dot.gov email', async () => {
            const response = await request(app)
                .post('/api/v1/decision_makers')
                .send(fixtureData.validDecision)
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.approverEmail).toMatch(/@dot\.gov$/);

            if (response.body && response.body.id) {
                createdDecisionId = response.body.id;
            }
        });

        it('should return 400 Bad Request for unauthorized approver email domain', async () => {
            const response = await request(app)
                .post('/api/v1/decision_makers')
                .send(fixtureData.invalidApproverDecision)
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/v1/decision_makers/:id', () => {
        it('should fetch the decision record by ID', async () => {
            const response = await request(app)
                .get(`/api/v1/decision_makers/${createdDecisionId}`)
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.id || response.body.decision_id).toBe(createdDecisionId);
        });

        it('should return 404 Not Found for missing decision', async () => {
            const response = await request(app)
                .get('/api/v1/decision_makers/00000000-0000-0000-0000-000000000000');

            expect(response.status).toBe(404);
        });
    });
});