// Wilayas and communes come from the BackEnd database (not from a file in the website).
import { api } from "./api";

// Communes already downloaded, so choosing the same wilaya twice does not call the server again
const communeCache = {};

// All 58 wilayas: [{ id, name, code }]
export const fetchWilayas = () => api("/api/geography/wilayas/", { auth: false });

// Communes of one wilaya: [{ id, name }]
export async function fetchCommunes(wilayaId) {
  if (!communeCache[wilayaId]) {
    communeCache[wilayaId] = await api(`/api/geography/communes/?wilaya_id=${wilayaId}`, { auth: false });
  }
  return communeCache[wilayaId];
}
