## Problem

Saving a route fails with `new row violates row-level security policy for table "driver_routes"`.

The existing policy `Drivers can manage their own routes` checks `auth.uid() = driver_id`, but `driver_routes.driver_id` is a foreign key to `drivers.id` (the drivers table primary key), not to the auth user id. The two UUIDs never match, so every insert/update/delete from a signed-in driver is rejected. This is a policy bug, not a client bug — no constraint you set.

## Fix

Replace the broken policy with one that maps `driver_id` back to the owning auth user through the `drivers` table.

New policy (ALL commands, USING + WITH CHECK):
```
driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
```

Steps:
1. Drop the existing `Drivers can manage their own routes` policy on `public.driver_routes`.
2. Recreate it with the correct predicate above, applied to `FOR ALL TO authenticated` with both `USING` and `WITH CHECK`.
3. Leave the passenger-visibility policy untouched.

No table structure changes, no frontend changes. After the migration, the same "Save route" call from `/driver/route` will succeed.
