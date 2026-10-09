CREATE TYPE notification_channel_enum AS ENUM (
    'Email',
    'InApp',
    'Webhook',
    'SMS'
);

CREATE TYPE notification_status_enum AS ENUM (
    'Pending',
    'Sent',
    'Failed',
    'Retrying'
);

CREATE TABLE notification_logs (
    notification_id BIGSERIAL PRIMARY KEY,
    notification_unique_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    event_id UUID,                                      -- Optional correlation reference to event_store_db.domain_events(event_id)
    issue_id BIGINT,                                    -- Logical reference to issue being alerted
    recipient_email VARCHAR(255) NOT NULL,
    channel notification_channel_enum NOT NULL DEFAULT 'Email',
    subject VARCHAR(255) NOT NULL,
    message_body TEXT NOT NULL,
    status notification_status_enum NOT NULL DEFAULT 'Pending',
    retry_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMPTZ
);

-- Performance Indexes
CREATE INDEX idx_notifications_issue_id ON notification_logs(issue_id);
CREATE INDEX idx_notifications_recipient ON notification_logs(recipient_email);
CREATE INDEX idx_notifications_status ON notification_logs(status);