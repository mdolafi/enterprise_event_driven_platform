CREATE TYPE issue_domain_enum AS ENUM (
    'Applications', 
    'Data', 
    'Infrastructure', 
    'Security', 
    'Governance'
);

CREATE TYPE issue_category_enum AS ENUM (
    'Standardization', 
    'Policy Violation', 
    'Architecture Review', 
    'Security Finding', 
    'Tech Debt'
);

CREATE TYPE issue_status_enum AS ENUM (
    'Submitted', 
    'SO Approved', 
    'SO Rejected', 
    'Under Investigation', 
    'In Review', 
    'Closed'
);

CREATE TABLE issues (
    issue_unique_id UUID PRIMARY KEY DEFAULT gen_random_bytes_v4(),
    issue_id SERIAL NOT NULL UNIQUE,
    issue_domain issue_domain_enum NOT NULL,
    issue_category issue_category_enum NOT NULL,
    system_name VARCHAR(255) NOT NULL,
    issue_title VARCHAR(255) NOT NULL,
    issue_description TEXT NOT NULL,
    submitter VARCHAR(255) NOT NULL, -- Logical reference to user_email_address
    system_owner_approval BOOLEAN NOT NULL DEFAULT FALSE,
    system_owner_approval_justification TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance & Lookup Indexes
CREATE INDEX idx_issues_issue_id ON issues(issue_id);
CREATE INDEX idx_issues_submitter ON issues(submitter);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_submitter_email ON issues(submitter);

-- Audit Tracking Table for Submitter State Changes
CREATE TABLE issue_audit_history (
    audit_id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES issues(issue_id) ON DELETE CASCADE,
    previous_status issue_status_enum,
    new_status issue_status_enum NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    change_reason TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);