import path from "path";
import maxmind from "maxmind";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let lookup: maxmind.Reader<maxmind.CityResponse> | null = null;
const dbPath = path.join(
  __dirname,
  "../../databases/geolite2citydb/GeoLite2-City.mmdb"
);

(async () => {
  try {
    lookup = await maxmind.open<maxmind.CityResponse>(dbPath);
    console.log("GeoLite database loaded successfully.");
  } catch (err) {
    console.error("Error loading the GeoLite database:", err);
  }
})();

export const getIpDetails = async (
  ip: string
): Promise<maxmind.CityResponse | null> => {
  if (!lookup) {
    console.error("GeoLite database is not loaded.");
    return null;
  }

  try {
    return lookup.get(ip) || null;
  } catch (err) {
    console.error("Failed to retrieve IP details:", err);
    return null;
  }
};
