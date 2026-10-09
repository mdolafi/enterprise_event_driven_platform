CREATE TABLE investigations (
    investigation_id BIGSERIAL PRIMARY KEY,
    investigation_unique_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    issue_id BIGINT NOT NULL,                           -- Logical reference to submitter_service_db.issues(issue_id)
    issue_unique_id UUID NOT NULL,                      -- Global UUID cross-reference
    investigator_email VARCHAR(255) NOT NULL,           -- Logical reference to user_service_db.users(user_email_address)
    investigator_name VARCHAR(255) NOT NULL,
    note TEXT NOT NULL,                                 -- Technical investigation findings
    is_confidential BOOLEAN NOT NULL DEFAULT FALSE,     -- Restricted access flag for sensitive security findings
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_investigations_issue_id ON investigations(issue_id);
CREATE INDEX idx_investigations_issue_unique_id ON investigations(issue_unique_id);
CREATE INDEX idx_investigations_investigator ON investigations(investigator_email);
