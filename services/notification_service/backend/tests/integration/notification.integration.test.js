const request = require('supertest');
const app = require('../../server');
const fixtureData = require('../../../tests/fixtures/notification_fixture.json');

describe('Notification Service - Integration Tests', () => {
    let createdNotificationId;

    describe('POST /api/v1/notifications', () => {
        it('should queue a notification for a recipient with @dot.gov domain', async () => {
            const response = await request(app)
                .post('/api/v1/notifications')
                .send(fixtureData.validNotification)
                .set('Accept', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.recipientEmail).toMatch(/@dot\.gov$/);

            createdNotificationId = response.body.id;
        });

        it('should return 400 Bad Request when recipient email is outside @dot.gov domain', async () => {
            const response = await request(app)
                .post('/api/v1/notifications')
                .send(fixtureData.invalidRecipientNotification)
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/notifications', () => {
        it('should return a list of notifications', async () => {
            const response = await request(app)
                .get('/api/v1/notifications')
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});