CREATE TABLE user_trust_scores (
    user_id                 UUID PRIMARY KEY REFERENCES users(id),
    score                   INTEGER NOT NULL DEFAULT 50,
    successful_sales        INTEGER NOT NULL DEFAULT 0,
    successful_purchases    INTEGER NOT NULL DEFAULT 0,
    reports_received        INTEGER NOT NULL DEFAULT 0,
    reports_confirmed       INTEGER NOT NULL DEFAULT 0,
    email_verified          BOOLEAN NOT NULL DEFAULT false,
    phone_verified          BOOLEAN NOT NULL DEFAULT false,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id),
    reviewer_id     UUID NOT NULL REFERENCES users(id),
    seller_id       UUID NOT NULL REFERENCES users(id),
    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_seller ON reviews(seller_id);
CREATE UNIQUE INDEX idx_reviews_transaction ON reviews(transaction_id);
