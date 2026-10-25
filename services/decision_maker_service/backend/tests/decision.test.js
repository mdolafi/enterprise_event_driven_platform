const fs = require('fs');
const path = require('path');

describe('Decision Maker Service - Fixture & Payload Validation', () => {
    let fixtureData;

    beforeAll(() => {
        const fixturePath = path.join(__dirname, '../../tests/fixtures/decision_fixture.json');
        const rawData = fs.readFileSync(fixturePath, 'utf8');
        fixtureData = JSON.parse(rawData);
    });

    test('Fixture payload contains required decision fields', () => {
        const sample = Array.isArray(fixtureData) ? fixtureData[0] : fixtureData;

        expect(sample).toBeDefined();
        expect(sample).toHaveProperty('issue_id');
        expect(sample).toHaveProperty('decision');
        expect(sample).toHaveProperty('decided_by');
        expect(sample).toHaveProperty('justification');
        expect(sample).toHaveProperty('action_items');
    });

    test('Decided_by email belongs to authorized Decision Maker domain', () => {
        const sample = Array.isArray(fixtureData) ? fixtureData[0] : fixtureData;
        expect(sample.decided_by).toMatch(/@dot\.gov$/);
    });
});