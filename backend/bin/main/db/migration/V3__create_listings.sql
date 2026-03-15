CREATE TABLE listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id         UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    starting_price  NUMERIC(10,2) NOT NULL,
    minimum_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
    current_price   NUMERIC(10,2) NOT NULL,
    category        TEXT NOT NULL,
    condition       TEXT,
    status          TEXT NOT NULL DEFAULT 'AVAILABLE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_sale ON listings(sale_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(current_price);
