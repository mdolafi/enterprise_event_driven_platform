CREATE TABLE domain_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(100) NOT NULL,               -- e.g., 'Issue', 'User', 'Vote', 'Decision'
    aggregate_id VARCHAR(255) NOT NULL,                -- Business ID (e.g., issue_id '1001' or issue_unique_id)
    event_type VARCHAR(100) NOT NULL,                  -- e.g., 'IssueCreated', 'SOApproved', 'VoteCast', 'IssueDecided'
    event_version INT NOT NULL DEFAULT 1,               -- Enables schema evolution for domain events
    payload JSONB NOT NULL,                             -- Full event snapshot stored as queryable JSON
    metadata JSONB,                                     -- Operational context (e.g., correlation_id, user_agent, IP)
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance & Audit Indexes
CREATE INDEX idx_events_aggregate ON domain_events(aggregate_type, aggregate_id);
CREATE INDEX idx_events_type ON domain_events(event_type);
CREATE INDEX idx_events_occurred_at ON domain_events(occurred_at DESC);
CREATE INDEX idx_events_payload_gin ON domain_events USING gin (payload); -- Allows ultra-fast JSON querying