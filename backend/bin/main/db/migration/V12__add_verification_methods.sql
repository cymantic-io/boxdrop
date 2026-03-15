CREATE TABLE verification_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    totp_secret TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, method_type)
);

CREATE INDEX idx_verification_methods_user_id ON verification_methods(user_id);

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
