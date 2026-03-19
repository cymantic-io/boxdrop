BEGIN;

WITH test_users AS (
    SELECT id
    FROM users
    WHERE email LIKE '%@test.com'
       OR email LIKE 'loadtest+%@example.com'
),
test_sales AS (
    SELECT id
    FROM sales
    WHERE seller_id IN (SELECT id FROM test_users)
),
test_listings AS (
    SELECT id
    FROM listings
    WHERE sale_id IN (SELECT id FROM test_sales)
),
test_threads AS (
    SELECT id
    FROM messaging_threads
    WHERE buyer_id IN (SELECT id FROM test_users)
       OR seller_id IN (SELECT id FROM test_users)
       OR listing_id IN (SELECT id FROM test_listings)
),
test_transactions AS (
    SELECT id
    FROM transactions
    WHERE buyer_id IN (SELECT id FROM test_users)
       OR seller_id IN (SELECT id FROM test_users)
       OR listing_id IN (SELECT id FROM test_listings)
),
test_reports AS (
    SELECT id
    FROM reports
    WHERE reporter_id IN (SELECT id FROM test_users)
),
test_offers AS (
    SELECT id
    FROM offers
    WHERE buyer_id IN (SELECT id FROM test_users)
       OR seller_id IN (SELECT id FROM test_users)
       OR listing_id IN (SELECT id FROM test_listings)
       OR thread_id IN (SELECT id FROM test_threads)
)

DELETE FROM offers
WHERE id IN (SELECT id FROM test_offers);

DELETE FROM messages
WHERE thread_id IN (SELECT id FROM test_threads)
   OR sender_id IN (SELECT id FROM test_users);

DELETE FROM verification_methods
WHERE user_id IN (SELECT id FROM test_users);

DELETE FROM saved_items
WHERE user_id IN (SELECT id FROM test_users)
   OR listing_id IN (SELECT id FROM test_listings);

DELETE FROM listing_images
WHERE listing_id IN (SELECT id FROM test_listings);

DELETE FROM reviews
WHERE reviewer_id IN (SELECT id FROM test_users)
   OR seller_id IN (SELECT id FROM test_users)
   OR transaction_id IN (SELECT id FROM test_transactions);

DELETE FROM reports
WHERE id IN (SELECT id FROM test_reports);

DELETE FROM transactions
WHERE id IN (SELECT id FROM test_transactions);

DELETE FROM messaging_threads
WHERE id IN (SELECT id FROM test_threads);

DELETE FROM listings
WHERE id IN (SELECT id FROM test_listings);

DELETE FROM sales
WHERE id IN (SELECT id FROM test_sales);

DELETE FROM user_trust_scores
WHERE user_id IN (SELECT id FROM test_users);

DELETE FROM users
WHERE id IN (SELECT id FROM test_users);

COMMIT;
