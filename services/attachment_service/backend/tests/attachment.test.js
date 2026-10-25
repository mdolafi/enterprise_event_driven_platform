const fs = require('fs');
const path = require('path');

describe('Attachment Service - Fixture & Payload Validation', () => {
    let fixtureData;

    beforeAll(() => {
        // Navigates up from backend/tests/ to attachment_service/tests/fixtures/
        const fixturePath = path.join(__dirname, '../../tests/fixtures/attachment_fixture.json');
        const rawData = fs.readFileSync(fixturePath, 'utf8');
        fixtureData = JSON.parse(rawData);
    });

    test('Fixture payload contains required attachment fields', () => {
        const sample = Array.isArray(fixtureData) ? fixtureData[0] : fixtureData;

        expect(sample).toBeDefined();
        expect(sample).toHaveProperty('file_id');
        expect(sample).toHaveProperty('file_name');
        expect(sample).toHaveProperty('mime_type');
        expect(sample).toHaveProperty('cloud_url');
        expect(sample).toHaveProperty('issue_id');
    });

    test('Cloud URL points to Google Drive integration', () => {
        const sample = Array.isArray(fixtureData) ? fixtureData[0] : fixtureData;
        expect(sample.cloud_url).toMatch(/^https:\/\/drive\.google\.com\//);
    });
});