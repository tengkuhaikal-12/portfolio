## Firebase Storage CORS (uploads from localhost / Netlify)

If gallery uploads fail in the browser with a CORS/preflight error (e.g. from `http://localhost:8888` to `firebasestorage.googleapis.com`), you need to apply the bucket CORS configuration.

- Edit `cors.json` as needed.
- Apply it to your bucket (requires Google Cloud SDK / `gsutil`):
  - `gsutil cors set cors.json gs://<your-storage-bucket>`

For this project’s default bucket, that is usually:

- `gsutil cors set cors.json gs://portfolio-b601e.appspot.com`
