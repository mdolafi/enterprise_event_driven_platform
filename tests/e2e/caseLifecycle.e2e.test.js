const axios = require('axios');

const ENDPOINTS = {
  user: 'http://localhost:8000/api/v1/users',
  submitter: 'http://localhost:8001/api/v1/submitters',
  voter: 'http://localhost:8002/api/v1/voters',
  decision: 'http://localhost:8003/api/v1/decision_makers',
  notification: 'http://localhost:8004/api/v1/notifications',
  investigation: 'http://localhost:8005/api/v1/investigations',
  attachment: 'http://localhost:8006/api/v1/attachments',
  eventStore: 'http://localhost:8007/api/v1/events'
};

async function waitForCondition(pollFn, description, timeoutMs = 15000, intervalMs = 600) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await pollFn();
      if (res) return res;
    } catch (_) {}
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Timeout after ${timeoutMs}ms waiting for: ${description}`);
}

describe('Enterprise E2E Case Lifecycle (Unmocked Podman Stack)', () => {
  const testRunId = Date.now();
  const testEmail = `mohammed.dolafi_${testRunId}@dot.gov`;
  let createdUserId;
  let createdProposalId;

  jest.setTimeout(35000);

  test('Stage 1: Provision Submitter User via user_service (8000)', async () => {
    const payload = {
      name: 'Mohammed Dolafi',
      email: testEmail,
      role: 'Submitter'
    };

    const res = await axios.post(ENDPOINTS.user, payload);
    expect([200, 201]).toContain(res.status);

    createdUserId = res.data.id || res.data.user_id || res.data.userId;
    expect(createdUserId).toBeDefined();
  });

  test('Stage 2: Submit Proposal via submitter_service (8001)', async () => {
    const payload = {
      email: testEmail,
      submitter_email: testEmail,
      name: 'Mohammed Dolafi',
      submitter_name: 'Mohammed Dolafi',
      title: 'Automated E2E Platform Verification Case',
      description: 'Triggering asynchronous downstream workflow',
      priority: 'HIGH',
      system_affected: 'Enterprise Core Platform'
    };

    const res = await axios.post(ENDPOINTS.submitter, payload);
    expect([200, 201]).toContain(res.status);

    createdProposalId = res.data.id || res.data.submission_id || res.data.proposal_id;
    expect(createdProposalId).toBeDefined();
  });

  test('Stage 3: Publish & Record Event in event_store_service (8007)', async () => {
    const payload = {
      event_type: 'ProposalCreated',
      aggregate_id: String(createdProposalId),
      source_service: 'submitter_service',
      payload: {
        proposal_id: createdProposalId,
        submitter_email: testEmail,
        status: 'SUBMITTED'
      }
    };

    const res = await axios.post(ENDPOINTS.eventStore, payload);
    expect([200, 201]).toContain(res.status);

    const eventId = res.data.id || res.data.event_id;
    expect(eventId).toBeDefined();

    const fetchRes = await axios.get(`${ENDPOINTS.eventStore}/${eventId}`);
    expect([200, 201]).toContain(fetchRes.status);
    expect(String(fetchRes.data.aggregate_id)).toBe(String(createdProposalId));
    expect(fetchRes.data.event_type).toBe('ProposalCreated');
  });

  test('Stage 4: Initiate Investigation Record in investigation_service (8005)', async () => {
    const payload = {
      proposal_id: String(createdProposalId),
      investigator_name: 'Lead Investigator',
      investigatorEmail: 'investigator@dot.gov',
      findings: 'Initial security and architecture assessment underway',
      status: 'INITIATED'
    };

    const res = await axios.post(ENDPOINTS.investigation, payload);
    expect([200, 201]).toContain(res.status);
    expect(res.data).toBeDefined();
  });

  test('Stage 5: Cast Vote in voter_service (8002)', async () => {
    const payload = {
      email: 'board.voter@dot.gov',
      name: 'Board Voter',
      role: 'VOTER'
    };

    const res = await axios.post(ENDPOINTS.voter, payload);
    expect([200, 201]).toContain(res.status);
  });

  test('Stage 6: Record Final Decision in decision_maker_service (8003)', async () => {
    const payload = {
      decision_maker_name: 'Director Johnson',
      proposal_id: String(createdProposalId),
      final_decision: 'APPROVED',
      notes: 'Final board approval granted',
      approverEmail: 'approver@dot.gov'
    };

    const res = await axios.post(ENDPOINTS.decision, payload);
    expect([200, 201]).toContain(res.status);
  });

  test('Stage 7: Dispatch Notification in notification_service (8004)', async () => {
    const payload = {
      recipient_email: testEmail,
      subject: `Proposal ${createdProposalId} Decision Finalized`,
      message_body: 'Your change request proposal has been formally approved.',
      notification_type: 'EMAIL'
    };

    const res = await axios.post(ENDPOINTS.notification, payload);
    expect([200, 201]).toContain(res.status);

    const notifId = res.data.id || res.data.notification_id;
    expect(notifId).toBeDefined();

    const fetchRes = await axios.get(`${ENDPOINTS.notification}/${notifId}`);
    expect([200, 201]).toContain(fetchRes.status);
    expect(fetchRes.data.recipient_email || fetchRes.data.recipient).toBe(testEmail);
  });
});
