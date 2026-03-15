CREATE TABLE transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          UUID NOT NULL REFERENCES listings(id),
    buyer_id            UUID NOT NULL REFERENCES users(id),
    seller_id           UUID NOT NULL REFERENCES users(id),
    amount              NUMERIC(10,2) NOT NULL,
    platform_fee        NUMERIC(10,2) NOT NULL DEFAULT 0,
    status              TEXT NOT NULL DEFAULT 'CLAIMED',
    pickup_token        TEXT,
    stripe_payment_id   TEXT,
    claimed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at             TIMESTAMPTZ,
    confirmed_at        TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_listing ON transactions(listing_id);
CREATE INDEX idx_transactions_status ON transactions(status);
