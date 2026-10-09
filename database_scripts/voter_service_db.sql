CREATE TYPE voter_choice_enum AS ENUM (
    'Recommend approval',
    'Recommend approval pending SO approval',
    'Recommend approval pending completion of Action Items',
    'Recommend On Hold',
    'Recommend Rejection'
);

CREATE TABLE votes (
    vote_id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL,                           -- Logical reference to submitter_service_db.issues(issue_id)
    issue_unique_id UUID NOT NULL,                      -- Global UUID cross-reference
    voter_email VARCHAR(255) NOT NULL,                  -- Logical reference to user_service_db.users(user_email_address)
    voter_name VARCHAR(255) NOT NULL,
    voter_choice voter_choice_enum NOT NULL,
    voter_justification TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Prevent duplicate voting by the same user on the same issue
    CONSTRAINT uq_voter_issue UNIQUE (issue_id, voter_email)
);

-- Performance Indexes
CREATE INDEX idx_votes_issue_id ON votes(issue_id);
CREATE INDEX idx_votes_issue_unique_id ON votes(issue_unique_id);
CREATE INDEX idx_votes_voter_email ON votes(voter_email);
