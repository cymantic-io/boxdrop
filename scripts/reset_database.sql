BEGIN;

TRUNCATE TABLE
  listing_images,
  messages,
  offers,
  reports,
  reviews,
  saved_items,
  transactions,
  messaging_threads,
  verification_methods,
  listings,
  sales,
  user_trust_scores,
  users
RESTART IDENTITY CASCADE;

COMMIT;
