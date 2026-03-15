CREATE TABLE offers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          UUID NOT NULL REFERENCES listings(id),
    thread_id           UUID NOT NULL REFERENCES messaging_threads(id),
    message_id          UUID NOT NULL UNIQUE REFERENCES messages(id),
    buyer_id            UUID NOT NULL REFERENCES users(id),
    seller_id           UUID NOT NULL REFERENCES users(id),
    amount              NUMERIC(10,2) NOT NULL,
    status              TEXT NOT NULL DEFAULT 'PENDING',
    previous_offer_id   UUID REFERENCES offers(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at        TIMESTAMPTZ
);

CREATE INDEX idx_offers_listing_status ON offers(listing_id, status);
CREATE INDEX idx_offers_thread ON offers(thread_id, created_at);
