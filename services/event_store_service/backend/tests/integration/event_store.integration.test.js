const request = require('supertest');

// Mock Database Layer
jest.mock('../../config/db', () => {
    const mockStorage = new Map();

    return {
        query: jest.fn(async (text, params) => {
            const queryStr = typeof text === 'string' ? text.toUpperCase() : '';

            if (queryStr.includes('INSERT')) {
                const id = 'evt_9001a2b3-e29b-41d4-a716-446655440000';
                const record = {
                    id,
                    event_id: id,
                    event_type: params ? params[0] : 'issue.ready_for_decision',
                    aggregate_id: params ? params[1] : 'ccb-2026-0042',
                    payload: params ? params[2] : {},
                    source_service: params ? params[3] : 'voter_service',
                    timestamp: params ? params[4] : new Date().toISOString()
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
                    id: id || 'evt_9001a2b3-e29b-41d4-a716-446655440000',
                    event_id: id || 'evt_9001a2b3-e29b-41d4-a716-446655440000',
                    event_type: 'issue.ready_for_decision',
                    aggregate_id: 'ccb-2026-0042',
                    timestamp: new Date().toISOString()
                };
                return { rows: [record] };
            }

            return { rows: [] };
        }),
        end: jest.fn(async () => Promise.resolve())
    };
});

const app = require('../../server');
const fixtureData = require('../../../tests/fixtures/event_store_fixture.json');

describe('Event Store Service - Integration Tests', () => {
    let createdEventId = 'evt_9001a2b3-e29b-41d4-a716-446655440000';

    describe('POST /api/v1/events', () => {
        it('should append an event to the ledger with valid metadata and @dot.gov source', async () => {
            const response = await request(app)
                .post('/api/v1/events')
                .send(fixtureData.validEvent)
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('timestamp');

            if (response.body && response.body.id) {
                createdEventId = response.body.id;
            }
        });

        it('should return 400 Bad Request when event payload structure is malformed', async () => {
            const response = await request(app)
                .post('/api/v1/events')
                .send(fixtureData.malformedEvent)
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/events/:id', () => {
        it('should retrieve event record from the event store', async () => {
            const response = await request(app)
                .get(`/api/v1/events/${createdEventId}`)
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(createdEventId);
        });

        it('should return 404 for unrecorded event ID', async () => {
            const response = await request(app)
                .get('/api/v1/events/00000000-0000-0000-0000-000000000000');

            expect(response.status).toBe(404);
        });
    });
});