CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE sales (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id     UUID NOT NULL REFERENCES users(id),
    title         TEXT NOT NULL,
    description   TEXT,
    address       TEXT NOT NULL,
    latitude      DOUBLE PRECISION NOT NULL,
    longitude     DOUBLE PRECISION NOT NULL,
    location      GEOGRAPHY(Point, 4326) NOT NULL,
    starts_at     TIMESTAMPTZ NOT NULL,
    ends_at       TIMESTAMPTZ NOT NULL,
    status        TEXT NOT NULL DEFAULT 'DRAFT',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_seller ON sales(seller_id);
CREATE INDEX idx_sales_location ON sales USING GIST(location);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_dates ON sales(starts_at, ends_at);
