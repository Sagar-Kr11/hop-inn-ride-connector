Implement a focused driver-auth fix:

1. **Add explicit driver login UI**
   - On `/auth?tab=driver&next=/driver`, show two clear paths:
     - **Login as Driver** for already-registered drivers.
     - **Register as Driver** for new drivers.
   - If the user is already signed in, show a clear **Continue to Driver Dashboard** button plus **Use a different account**.

2. **Separate login from registration behavior**
   - Add a dedicated driver-login handler that signs in with Google and returns to `/auth?tab=driver&next=/driver&intent=login`.
   - After sign-in, it checks whether a driver profile exists.
   - If it exists, navigate to `/driver`.
   - If it does not exist, show a friendly “No driver profile found” message and offer registration instead of attempting an insert or showing a database error.

3. **Keep registration defensive**
   - Keep the existing pre-check before insert.
   - If the account already has a driver profile, skip insert and route to `/driver`.
   - After a new insert, continue polling until the driver row is visible before navigating, so the dashboard does not bounce back to auth.

4. **Make dashboard auth redirects less confusing**
   - Keep driver-specific redirects using `/auth?tab=driver&next=/driver`.
   - On `/driver`, show a short loading/auth-check state before redirecting, so late Google session hydration does not immediately bounce users back.

5. **Temporary debug visibility**
   - Keep/add plain console markers for: driver login click, OAuth return/session found, driver-row check result, registration insert, confirmation polling, and final navigation.
   - This will make any remaining bounce traceable instead of guessed.