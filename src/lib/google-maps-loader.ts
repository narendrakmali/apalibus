
import { Loader } from '@googlemaps/js-api-loader';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

let loaderInstance: Loader | null = null;
let promise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    console.error("Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.");
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: googleMapsApiKey,
      version: 'weekly',
      libraries,
    });
  }

  if (!promise) {
    promise = loaderInstance.load().then(() => {
      console.log("Google Maps script loaded successfully.");
    }).catch(e => {
      console.error("Error loading Google Maps script:", e);
      // Reset promise on failure to allow retries
      promise = null; 
      throw e;
    });
  }

  return promise;
};
