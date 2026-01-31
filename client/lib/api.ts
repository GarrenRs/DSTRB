import { ATM, ATMStatus } from "@/types/atm";
import { getApiUrl } from "@/lib/query-client";
import { getDeviceHash, saveLocalReport, getLocalReportForATM } from "@/lib/storage";
import { calculateDistance } from "@/lib/location";

export async function fetchNearbyATMs(
  lat: number,
  lng: number,
  radius: number = 15000
): Promise<ATM[]> {
  try {
    const baseUrl = getApiUrl();
    const url = new URL("/api/atms/nearby", baseUrl);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lng", lng.toString());
    url.searchParams.set("radius", radius.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch ATMs");
    }

    const atms: ATM[] = await response.json();

    const atmsWithStatus = await Promise.all(
      atms.map(async (atm) => {
        const localReport = await getLocalReportForATM(atm.id);
        const distance = calculateDistance(lat, lng, atm.lat, atm.lng);
        return {
          ...atm,
          status: localReport?.status || atm.status || "unknown",
          lastReportedAt: localReport?.timestamp || atm.lastReportedAt,
          distance,
        };
      })
    );

    return atmsWithStatus.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } catch (error) {
    console.error("Error fetching ATMs:", error);
    throw error;
  }
}

export async function reportATMStatus(
  atmId: number,
  status: ATMStatus
): Promise<boolean> {
  try {
    const deviceHash = await getDeviceHash();

    await saveLocalReport(atmId, status);

    try {
      const baseUrl = getApiUrl();
      const url = new URL("/api/report", baseUrl);

      await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          atm_id: atmId,
          status,
          device_hash: deviceHash,
        }),
      });
    } catch {
      console.log("Server sync failed, report saved locally");
    }

    return true;
  } catch {
    return false;
  }
}
