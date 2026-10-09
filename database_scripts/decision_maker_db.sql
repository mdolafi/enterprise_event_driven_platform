CREATE TYPE decision_outcome_enum AS ENUM (
    'Approved',
    'Approved pending completion of Action Items',
    'On Hold',
    'Rejected'
);

CREATE TABLE decisions (
    decision_id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT UNIQUE NOT NULL,                    -- One binding decision per issue
    issue_unique_id UUID NOT NULL,                      -- Global UUID cross-reference
    decision_maker_email VARCHAR(255) NOT NULL,         -- Logical reference to user_service_db.users(user_email_address)
    authority VARCHAR(100) NOT NULL DEFAULT 'CCB',      -- Decision body (e.g., CCB, ARB, Executive)
    decision decision_outcome_enum NOT NULL,
    action_items TEXT,                                  -- Required conditions/tasks before execution
    decision_comments TEXT NOT NULL,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_decisions_issue_id ON decisions(issue_id);
CREATE INDEX idx_decisions_issue_unique_id ON decisions(issue_unique_id);
CREATE INDEX idx_decisions_authority ON decisions(authority);