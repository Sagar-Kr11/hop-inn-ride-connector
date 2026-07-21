let googleMapsLoaderPromise: Promise<void> | null = null;

const CALLBACK_NAME = "__initHopInnGoogleMaps";

export const loadGoogleMaps = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }

  if ((window as any).google?.maps) return Promise.resolve();
  if (googleMapsLoaderPromise) return googleMapsLoaderPromise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

  if (!key) {
    return Promise.reject(new Error("Google Maps key is not configured"));
  }

  googleMapsLoaderPromise = new Promise<void>((resolve, reject) => {
    (window as any)[CALLBACK_NAME] = () => resolve();

    const existing = document.querySelector<HTMLScriptElement>('script[data-hopinn-google-maps="true"]');
    if (existing) return;

    const script = document.createElement("script");
    script.dataset.hopinnGoogleMaps = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async&callback=${CALLBACK_NAME}${channel ? `&channel=${channel}` : ""}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return googleMapsLoaderPromise;
};