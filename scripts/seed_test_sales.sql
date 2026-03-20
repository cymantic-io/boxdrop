-- Seed script: 5 test sales near Fredericktown, MO 63645
-- Each sale has 2-3 listings with realistic garage sale items and photos
-- Password for all test users: "password123" (bcrypt hash below)

BEGIN;

-- BCrypt hash for "password123" with cost 12
\set pw '''$2a$12$LJ3m4ys3LkfE5ljNFKBJceIUKONJQZHxNQEDCY13GN1MAwGh3H6XK'''

-- ============================================================
-- 1. Create test users
-- ============================================================
INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'seller1@test.com', :pw, 'Maria''s Garage', now(), now()),
  ('a0000001-0000-0000-0000-000000000002', 'seller2@test.com', :pw, 'Dave''s Yard Sale', now(), now()),
  ('a0000001-0000-0000-0000-000000000003', 'seller3@test.com', :pw, 'The Johnson Family', now(), now()),
  ('a0000001-0000-0000-0000-000000000004', 'seller4@test.com', :pw, 'Ozark Clearout', now(), now()),
  ('a0000001-0000-0000-0000-000000000005', 'seller5@test.com', :pw, 'Country Road Finds', now(), now()),
  ('a0000001-0000-0000-0000-000000000101', 'buyer1@test.com', :pw, 'Test Buyer One', now(), now()),
  ('a0000001-0000-0000-0000-000000000102', 'buyer2@test.com', :pw, 'Test Buyer Two', now(), now()),
  ('a0000001-0000-0000-0000-000000000103', 'buyer3@test.com', :pw, 'Test Buyer Three', now(), now())
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 2. Create 5 sales near Fredericktown, MO (status = ACTIVE)
-- ============================================================

-- Sale 1 – Downtown Fredericktown
INSERT INTO sales (id, seller_id, title, description, address, latitude, longitude, location, starts_at, ends_at, status, created_at, updated_at) VALUES
  ('b0000001-0000-0000-0000-000000000001',
   'a0000001-0000-0000-0000-000000000001',
   'Downtown Fredericktown Moving Sale',
   'Moving out — furniture, books, kitchenware, and more!',
   '120 S Main St, Fredericktown, MO 63645',
   37.5597, -90.2940,
   ST_SetSRID(ST_MakePoint(-90.2940, 37.5597), 4326)::geography,
   now(), now() + interval '3 days', 'ACTIVE', now(), now());

-- Sale 2 – West side of Fredericktown (near Hwy 72)
INSERT INTO sales (id, seller_id, title, description, address, latitude, longitude, location, starts_at, ends_at, status, created_at, updated_at) VALUES
  ('b0000001-0000-0000-0000-000000000002',
   'a0000001-0000-0000-0000-000000000002',
   'Highway 72 Weekend Yard Sale',
   'Tons of kids'' toys, sporting goods, and electronics.',
   '305 W Main St, Fredericktown, MO 63645',
   37.5600, -90.3010,
   ST_SetSRID(ST_MakePoint(-90.3010, 37.5600), 4326)::geography,
   now(), now() + interval '2 days', 'ACTIVE', now(), now());

-- Sale 3 – East Fredericktown (near Madison County Fairgrounds)
INSERT INTO sales (id, seller_id, title, description, address, latitude, longitude, location, starts_at, ends_at, status, created_at, updated_at) VALUES
  ('b0000001-0000-0000-0000-000000000003',
   'a0000001-0000-0000-0000-000000000003',
   'Fairgrounds Area Estate Sale',
   'Vintage collectibles, antique furniture, and vinyl records.',
   '615 Walnut St, Fredericktown, MO 63645',
   37.5630, -90.2870,
   ST_SetSRID(ST_MakePoint(-90.2870, 37.5630), 4326)::geography,
   now(), now() + interval '4 days', 'ACTIVE', now(), now());

-- Sale 4 – North Fredericktown (near the park)
INSERT INTO sales (id, seller_id, title, description, address, latitude, longitude, location, starts_at, ends_at, status, created_at, updated_at) VALUES
  ('b0000001-0000-0000-0000-000000000004',
   'a0000001-0000-0000-0000-000000000004',
   'Ozark Hills Garage Cleanout',
   'Tools, outdoor equipment, lawn mowers, and farm supplies.',
   '410 N Mine La Motte Ave, Fredericktown, MO 63645',
   37.5670, -90.2925,
   ST_SetSRID(ST_MakePoint(-90.2925, 37.5670), 4326)::geography,
   now(), now() + interval '2 days', 'ACTIVE', now(), now());

-- Sale 5 – South Fredericktown (near Hwy 67)
INSERT INTO sales (id, seller_id, title, description, address, latitude, longitude, location, starts_at, ends_at, status, created_at, updated_at) VALUES
  ('b0000001-0000-0000-0000-000000000005',
   'a0000001-0000-0000-0000-000000000005',
   'Country Road Spring Sale',
   'Baby gear, home décor, plants, and handmade crafts.',
   '820 S Hwy 67, Fredericktown, MO 63645',
   37.5520, -90.2890,
   ST_SetSRID(ST_MakePoint(-90.2890, 37.5520), 4326)::geography,
   now(), now() + interval '5 days', 'ACTIVE', now(), now());

-- ============================================================
-- 3. Create listings for each sale (2-3 per sale)
-- ============================================================

-- Sale 1 listings (Downtown Fredericktown)
INSERT INTO listings (id, sale_id, title, description, starting_price, minimum_price, current_price, category, condition, status) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001',
   'IKEA Kallax Shelf', '4x4 white shelf unit, great condition', 60.00, 20.00, 60.00, 'Furniture', 'Good', 'AVAILABLE'),
  ('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001',
   'Box of Paperback Novels', '~30 sci-fi and mystery books', 15.00, 5.00, 15.00, 'Books', 'Good', 'AVAILABLE'),
  ('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001',
   'KitchenAid Stand Mixer', 'Red, 5-quart, barely used', 120.00, 60.00, 120.00, 'Kitchen', 'Like New', 'AVAILABLE');

-- Sale 2 listings (Hwy 72)
INSERT INTO listings (id, sale_id, title, description, starting_price, minimum_price, current_price, category, condition, status) VALUES
  ('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000002',
   'Kids'' Bicycle (16")', 'Blue Schwinn with training wheels', 40.00, 15.00, 40.00, 'Sports', 'Good', 'AVAILABLE'),
  ('c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000002',
   'Nintendo Switch Bundle', 'Console + 3 games + case', 200.00, 120.00, 200.00, 'Electronics', 'Good', 'AVAILABLE');

-- Sale 3 listings (Fairgrounds Area)
INSERT INTO listings (id, sale_id, title, description, starting_price, minimum_price, current_price, category, condition, status) VALUES
  ('c0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000003',
   'Mid-Century Coffee Table', 'Walnut, minor surface scratches', 180.00, 80.00, 180.00, 'Furniture', 'Fair', 'AVAILABLE'),
  ('c0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000003',
   'Vinyl Record Collection', '50+ jazz and soul LPs from the 60s-70s', 90.00, 40.00, 90.00, 'Collectibles', 'Good', 'AVAILABLE'),
  ('c0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000003',
   'Ceramic Vase Set', 'Handmade, set of 3', 35.00, 15.00, 35.00, 'Home Decor', 'Like New', 'AVAILABLE');

-- Sale 4 listings (North Fredericktown)
INSERT INTO listings (id, sale_id, title, description, starting_price, minimum_price, current_price, category, condition, status) VALUES
  ('c0000001-0000-0000-0000-000000000009', 'b0000001-0000-0000-0000-000000000004',
   'Craftsman Tool Chest', 'Rolling, 5-drawer, fully stocked', 250.00, 150.00, 250.00, 'Tools', 'Good', 'AVAILABLE'),
  ('c0000001-0000-0000-0000-000000000010', 'b0000001-0000-0000-0000-000000000004',
   'John Deere Push Mower', 'Self-propelled, runs great', 150.00, 80.00, 150.00, 'Outdoor', 'Good', 'AVAILABLE');

-- Sale 5 listings (South Fredericktown)
INSERT INTO listings (id, sale_id, title, description, starting_price, minimum_price, current_price, category, condition, status) VALUES
  ('c0000001-0000-0000-0000-000000000011', 'b0000001-0000-0000-0000-000000000005',
   'UPPAbaby Vista Stroller', 'With bassinet and toddler seat', 280.00, 140.00, 280.00, 'Baby', 'Good', 'AVAILABLE'),
  ('c0000001-0000-0000-0000-000000000012', 'b0000001-0000-0000-0000-000000000005',
   'Handmade Quilt (Queen)', 'Log cabin pattern, locally made', 75.00, 35.00, 75.00, 'Home Decor', 'Like New', 'AVAILABLE'),
  ('c0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000005',
   'Cast Iron Skillet Set', 'Lodge, set of 3, well-seasoned', 45.00, 20.00, 45.00, 'Kitchen', 'Good', 'AVAILABLE');

-- ============================================================
-- 4. Add representative listing photos
-- Images are downloaded locally and uploaded into MinIO under seed/listings/.
-- ============================================================
INSERT INTO listing_images (listing_id, image_url, sort_order) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'http://localhost:9000/boxdrop-images/seed/listings/ikea-kallax-shelf.jpg', 0),
  ('c0000001-0000-0000-0000-000000000002', 'http://localhost:9000/boxdrop-images/seed/listings/box-of-paperback-novels.jpg', 0),
  ('c0000001-0000-0000-0000-000000000003', 'http://localhost:9000/boxdrop-images/seed/listings/kitchenaid-stand-mixer.jpg', 0),
  ('c0000001-0000-0000-0000-000000000004', 'http://localhost:9000/boxdrop-images/seed/listings/kids-bicycle.jpg', 0),
  ('c0000001-0000-0000-0000-000000000005', 'http://localhost:9000/boxdrop-images/seed/listings/nintendo-switch-bundle.jpg', 0),
  ('c0000001-0000-0000-0000-000000000006', 'http://localhost:9000/boxdrop-images/seed/listings/mid-century-coffee-table.jpg', 0),
  ('c0000001-0000-0000-0000-000000000007', 'http://localhost:9000/boxdrop-images/seed/listings/vinyl-record-collection.jpg', 0),
  ('c0000001-0000-0000-0000-000000000008', 'http://localhost:9000/boxdrop-images/seed/listings/ceramic-vase-set.jpg', 0),
  ('c0000001-0000-0000-0000-000000000009', 'http://localhost:9000/boxdrop-images/seed/listings/craftsman-tool-chest.webp', 0),
  ('c0000001-0000-0000-0000-000000000010', 'http://localhost:9000/boxdrop-images/seed/listings/john-deere-push-mower.jpg', 0),
  ('c0000001-0000-0000-0000-000000000011', 'http://localhost:9000/boxdrop-images/seed/listings/uppababy-vista-stroller.jpg', 0),
  ('c0000001-0000-0000-0000-000000000012', 'http://localhost:9000/boxdrop-images/seed/listings/handmade-quilt-queen.jpg', 0),
  ('c0000001-0000-0000-0000-000000000013', 'http://localhost:9000/boxdrop-images/seed/listings/cast-iron-skillet-set.jpg', 0);

COMMIT;
