import AsyncStorage from "@react-native-async-storage/async-storage";
import { ATMStatus } from "@/types/atm";

const DEVICE_HASH_KEY = "@cash_radar_device_hash";
const ATM_REPORTS_KEY = "@cash_radar_atm_reports";

interface StoredReport {
  atm_id: number;
  status: ATMStatus;
  timestamp: string;
}

export async function getDeviceHash(): Promise<string> {
  try {
    let hash = await AsyncStorage.getItem(DEVICE_HASH_KEY);
    if (!hash) {
      hash = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(DEVICE_HASH_KEY, hash);
    }
    return hash;
  } catch {
    return `temp_${Date.now()}`;
  }
}

export async function getLocalReports(): Promise<Record<number, StoredReport>> {
  try {
    const data = await AsyncStorage.getItem(ATM_REPORTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export async function saveLocalReport(
  atmId: number,
  status: ATMStatus
): Promise<void> {
  try {
    const reports = await getLocalReports();
    reports[atmId] = {
      atm_id: atmId,
      status,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(ATM_REPORTS_KEY, JSON.stringify(reports));
  } catch {
    console.error("Failed to save local report");
  }
}

export async function getLocalReportForATM(
  atmId: number
): Promise<StoredReport | null> {
  const reports = await getLocalReports();
  return reports[atmId] || null;
}
