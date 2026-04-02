const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const API_URL_FROM_ENV = process.env.NEXT_PUBLIC_API_URL?.trim();
const BACKEND_URL_FROM_ENV = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

const backendBaseFromApi = API_URL_FROM_ENV
  ? trimTrailingSlash(API_URL_FROM_ENV).replace(/\/api\/v1$/, "")
  : null;

export const BACKEND_BASE_URL = trimTrailingSlash(
  BACKEND_URL_FROM_ENV || backendBaseFromApi || "https://adhyaan.onrender.com",
);

export const API_BASE_URL = trimTrailingSlash(
  API_URL_FROM_ENV || `${BACKEND_BASE_URL}/api/v1`,
);

export const getApiBaseUrl = () => API_BASE_URL;
export const getBackendBaseUrl = () => BACKEND_BASE_URL;
