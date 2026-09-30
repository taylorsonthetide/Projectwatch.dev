# Account system setup (development preview)

The existing courses and vessel flow remain available while `enabled: false` in
`js/account-config.js`. `accounts.html` previews the account design but disables
registration until a real backend is configured. No pretend accounts are created.

## Connect the backend

1. Create a Supabase project owned by Clifton. Choose the project region and plan
   in that account; this code does not create or purchase an external service.
2. Run `backend/accounts.sql` in its SQL editor.
3. Enable email/password authentication, email confirmation, and a minimum
   password length of 12. Configure a production mail sender before launch.
4. Set the Auth Site URL to the actual site. Allow its exact `accounts.html` URL
   as a redirect URL for confirmation and password recovery. For development:
   `https://taylorsonthetide.github.io/Projectwatch.dev/accounts.html`.
5. Set the project URL and **publishable** key in `js/account-config.js`.
   Never use a secret or service-role key in browser code or GitHub. Set
   `enabled: true` only once the backend and email callbacks have been tested.
6. Clifton registers and confirms his account. Add his actual Auth user UUID to
   `pw_private.owners` in the SQL editor. No learner can grant themselves this role.
7. Finalize and publish the actual privacy information (operator, purposes,
   providers, retention, rights and contact), and add its link to the registration
   page before public launch. No marketing subscription or onward-sharing consent
   is inferred from creating an account.

## Behavior

- Sign in / sign up / confirm email / reset password, then continue to the existing
  vessel selection. No course, assessment or question-bank content changes.
- Existing guest browser data is preserved. Import is an explicit account action
  and adds missing keys only; account records take priority.
- Each learner has a separate local cache and a durable pending-change journal.
  Vessel saves that reload the page keep unsent changes for the next sync.
- Only the allowlisted vessel/course state keys sync; passwords, Auth tokens,
  image-library caches and engineering/test settings never enter that table.
- Deletions sync as null tombstones. Updates are per key; simultaneous devices
  editing the same record use last server write wins. Different records do not
  replace an entire account snapshot. For now, log back in to fetch changes from
  another device; continuous live merging of open training sessions is not included.
- The dashboard shows registrations, confirmed emails, last login/training visit,
  and self-reported CEVNI module counts. SQL owner checks enforce access.
- Local cached data remains on the device after logout, isolated by user UUID.
  This is intended for personal devices; clear site data after shared-device use.

## Verify before activation

Run `node tests/accounts-storage.cjs` and `node tests/accounts-browser.cjs`.
The browser test uses mocked Auth/database responses; it cannot prove deployment.
Run `node tests/accounts-sql.cjs` for isolated PostgreSQL policy tests if PGlite is installed.

On the real configured service, verify: email confirmation callback; login and
recovery email; account A cannot read/write account B's state; learners cannot
read the roster or assign owner roles; reload immediately after vessel selection;
course completion sync; logout/login and a second device; offline save and retry.
Do not describe the backend as live until these checks pass.

## Dependencies

`js/vendor/supabase-2.102.0.js` is the pinned Supabase JS UMD distribution from
`@supabase/supabase-js` 2.102.0 (MIT). See the adjacent licence file.
