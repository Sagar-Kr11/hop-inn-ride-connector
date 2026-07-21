## Plan

The location search is failing because the current Google Places Autocomplete request is sending `locationBias` in a shape that the Maps JavaScript API rejects. The visible error confirms the request reaches Google, but Google rejects the bias object before returning suggestions.

## Fix

1. Update `PlaceAutocomplete` to use the supported Places Autocomplete bias format:
   - Replace the nested `circle: { center, radius }` value with a simpler point bias object.
   - Keep `includedRegionCodes: ["in"]` so results stay India-focused.

2. Make selection more reliable:
   - Ignore the synthetic “Places lookup failed” row so clicking it does not try to fetch details for a fake place id.
   - Use the modern `placePrediction.toPlace()` path when available to fetch selected place coordinates.

3. Verify in the preview:
   - Open `/booking`.
   - Type a real location like “Sagar” or “PVR Pune”.
   - Confirm real Google suggestions appear and selecting one fills the field with coordinates.