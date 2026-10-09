-- Create databases/extensions if needed and execute all microservice migrations

-- 1. Submitter Service Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS issues (
    issue_unique_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    issue_id BIGSERIAL NOT NULL UNIQUE,
    issue_title VARCHAR(255) NOT NULL,
    issue_status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (issue_status IN ('Open', 'Closed')),
    issue_category VARCHAR(50) NOT NULL DEFAULT 'Minor' CHECK (issue_category IN ('Minor', 'Major')),
    issue_priority VARCHAR(50) NOT NULL DEFAULT 'Low' CHECK (issue_priority IN ('Low', 'High', 'Emergency')),
    issue_domain VARCHAR(100) NOT NULL CHECK (issue_domain IN ('Application', 'Infrastructure', 'Security', 'EA')),
    assigned_to VARCHAR(320) NOT NULL,
    issue_submitter VARCHAR(320) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    issue_description TEXT NOT NULL,
    issue_justification TEXT NULL,
    outage VARCHAR(50) NOT NULL,
    postmaster VARCHAR(320) NULL,
    issue_proposed_impl_date DATE NOT NULL,
    issue_review_date DATE NULL,
    system_owner_approval VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (system_owner_approval IN ('Pending', 'Approved')),
    system_owner_approval_justification TEXT NULL,
    attachment_s3_url VARCHAR(2048) NULL
);

-- 2. Voter Service Schema
CREATE TABLE IF NOT EXISTS votes (
    vote_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    voter_email VARCHAR(320) NOT NULL,
    voter_name VARCHAR(255) NOT NULL,
    voter_choice VARCHAR(100) NOT NULL CHECK (
        voter_choice IN (
            'Recommend approval',
            'Recommend approval pending SO approval',
            'Recommend approval pending completion of Action Items',
            'Recommend On Hold',
            'Recommend Rejection'
        )
    ),
    voter_justification TEXT NULL,
    issue_unique_id VARCHAR(36) NOT NULL,
    issue_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_voter_per_issue UNIQUE (issue_id, voter_email)
);

-- 3. Decision-Maker Service Schema
CREATE TABLE IF NOT EXISTS decisions (
    decision_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    decision_maker_email VARCHAR(320) NOT NULL,
    decision VARCHAR(100) NOT NULL CHECK (
        decision IN (
            'Approved', 
            'Rejected', 
            'Approved pending SO approval', 
            'Approved pending completion of Action Items', 
            'On Hold'
        )
    ),
    decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
    action_items TEXT NULL,
    authority VARCHAR(50) NOT NULL CHECK (authority IN ('CCB', 'CIO')),
    decision_comments TEXT NULL,
    issue_unique_id VARCHAR(36) NOT NULL,
    issue_id BIGINT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_decisions_issue_unique_id ON decisions(issue_unique_id);
CREATE INDEX IF NOT EXISTS idx_decisions_issue_id ON decisions(issue_id);

-- 4. Investigation Service Schema
CREATE TABLE IF NOT EXISTS investigations (
    investigation_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    voter_email VARCHAR(320) NOT NULL,
    voter_name VARCHAR(255) NULL,
    note TEXT NOT NULL,
    issue_unique_id VARCHAR(36) NOT NULL,
    issue_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_investigation_per_voter UNIQUE (issue_id, voter_email)
);
CREATE INDEX IF NOT EXISTS idx_investigations_issue_unique_id ON investigations(issue_unique_id);
CREATE INDEX IF NOT EXISTS idx_investigations_issue_id ON investigations(issue_id);
CREATE INDEX IF NOT EXISTS idx_investigations_voter_email ON investigations(voter_email);

-- 5. Notification Service Schema
CREATE TABLE IF NOT EXISTS notifications (
    notification_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    alert_type VARCHAR(50) NOT NULL CHECK (
        alert_type IN (
            'Issue Submitted',
            'Provide Your Vote',
            'Ready For Decision',
            'Provide Your Decision',
            'Issue Decided'
        )
    ),
    alert_message TEXT NOT NULL,
    issue_unique_id VARCHAR(36) NOT NULL,
    issue_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_issue_unique_id ON notifications(issue_unique_id);
CREATE INDEX IF NOT EXISTS idx_notifications_issue_id ON notifications(issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 6. User Service Schema
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_name VARCHAR(255) NOT NULL,
    user_email_address VARCHAR(320) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Submitter', 'Voter', 'Decision Maker', 'Admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(user_email_address);

-- 7. Attachment Service Schema
CREATE TABLE IF NOT EXISTS attachments (
    attachment_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    attachment_name VARCHAR(255) NOT NULL,
    s3_bucket_path VARCHAR(1024) NOT NULL,
    attachment_type VARCHAR(100) NOT NULL,
    attachment_size_bytes BIGINT NULL,
    issue_unique_id VARCHAR(36) NOT NULL,
    issue_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attachments_issue_unique_id ON attachments(issue_unique_id);
CREATE INDEX IF NOT EXISTS idx_attachments_issue_id ON attachments(issue_id);

-- 8. Event Store Service Schema
CREATE TABLE IF NOT EXISTS domain_events (
    event_id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    issue_unique_id VARCHAR(36) NOT NULL,
    issue_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_domain_events_issue_id ON domain_events(issue_id);
CREATE INDEX IF NOT EXISTS idx_domain_events_issue_unique_id ON domain_events(issue_unique_id);
CREATE INDEX IF NOT EXISTS idx_domain_events_event_type ON domain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_domain_events_created_at ON domain_events(created_at);