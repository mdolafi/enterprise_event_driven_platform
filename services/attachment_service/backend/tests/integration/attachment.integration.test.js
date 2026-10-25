const request = require('supertest');

// 1. Mock Database
jest.mock('../../config/db', () => {
    const mockStorage = new Map();

    return {
        query: jest.fn(async (text, params) => {
            const queryStr = typeof text === 'string' ? text.toUpperCase() : '';

            if (queryStr.includes('INSERT')) {
                const id = '123e4567-e89b-12d3-a456-426614174000';
                const record = {
                    id,
                    attachment_id: id,
                    proposal_id: params ? params[0] : 'ccb-2026-0042',
                    uploaderEmail: params ? params[1] : 'analyst@dot.gov',
                    filename: params ? params[2] : 'db_performance_report.pdf'
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
                    id: id || '123e4567-e89b-12d3-a456-426614174000',
                    attachment_id: id || '123e4567-e89b-12d3-a456-426614174000',
                    proposal_id: 'ccb-2026-0042',
                    uploaderEmail: 'analyst@dot.gov'
                };
                return { rows: [record] };
            }

            return { rows: [] };
        }),
        end: jest.fn(async () => Promise.resolve())
    };
});

const app = require('../../server');
const fixtureData = require('../../../tests/fixtures/attachment_fixture.json');

describe('Attachment Service - Integration Tests', () => {
    let createdAttachmentId = '123e4567-e89b-12d3-a456-426614174000';

    describe('POST /api/v1/attachments', () => {
        it('should successfully upload metadata for a valid attachment and return 201', async () => {
            const response = await request(app)
                .post('/api/v1/attachments')
                .send(fixtureData.validAttachment)
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');

            if (response.body && response.body.id) {
                createdAttachmentId = response.body.id;
            }
        });

        it('should return 400 Bad Request when uploader email is non-@dot.gov domain', async () => {
            const response = await request(app)
                .post('/api/v1/attachments')
                .send(fixtureData.invalidUploaderAttachment)
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/v1/attachments/:id', () => {
        it('should retrieve attachment details by ID and return 200', async () => {
            const response = await request(app)
                .get(`/api/v1/attachments/${createdAttachmentId}`)
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body.id || response.body.attachment_id).toBe(createdAttachmentId);
        });

        it('should return 404 Not Found for non-existent attachment ID', async () => {
            const response = await request(app)
                .get('/api/v1/attachments/00000000-0000-0000-0000-000000000000');

            expect(response.status).toBe(404);
        });
    });
});