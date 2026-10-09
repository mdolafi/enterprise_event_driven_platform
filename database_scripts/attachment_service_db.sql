CREATE TABLE attachments (
    attachment_id BIGSERIAL PRIMARY KEY,
    attachment_unique_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    issue_id BIGINT NOT NULL,                           -- Logical reference to submitter_service_db.issues(issue_id)
    uploaded_by_email VARCHAR(255) NOT NULL,            -- Logical reference to user_service_db.users(user_email_address)
    file_name VARCHAR(255) NOT NULL,                    -- Original file name (e.g., 'architecture_diagram.png')
    file_path VARCHAR(512) NOT NULL,                    -- Internal storage URI/path (e.g., 's3://marad-attachments/2026/1001/')
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,                    -- e.g., 'application/pdf', 'image/png'
    checksum_sha256 VARCHAR(64) NOT NULL,              -- File integrity verification hash
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_attachments_issue_id ON attachments(issue_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by_email);
CREATE INDEX idx_attachments_checksum ON attachments(checksum_sha256);