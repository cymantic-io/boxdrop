# Load tests

Run the load test directly from the `tests/load` folder:

```
BASE_URL=http://localhost:8080 k6 run api_load_test.js
```

The script registers a dedicated `loadtest+...@example.com` user and creates a sale/listing. After the run completes, clean up that test data with:

```
./scripts/cleanup_test_data.sh
```

If you run multiple scenarios, you can re-run the cleanup script between runs to keep the database in the seeded state.
