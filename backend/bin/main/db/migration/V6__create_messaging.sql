CREATE TABLE messaging_threads (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id    UUID NOT NULL REFERENCES users(id),
    seller_id   UUID NOT NULL REFERENCES users(id),
    listing_id  UUID NOT NULL REFERENCES listings(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_threads_buyer ON messaging_threads(buyer_id);
CREATE INDEX idx_threads_seller ON messaging_threads(seller_id);
CREATE INDEX idx_threads_listing ON messaging_threads(listing_id);

CREATE TABLE messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id   UUID NOT NULL REFERENCES messaging_threads(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES users(id),
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at     TIMESTAMPTZ
);

CREATE INDEX idx_messages_thread ON messages(thread_id);
