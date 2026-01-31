export type ATMStatus = "working" | "no_cash" | "out_of_service" | "unknown";

export interface ATM {
  id: number;
  lat: number;
  lng: number;
  name: string | null;
  bank: string | null;
  address?: string | null;
  status: ATMStatus;
  confidence?: number;
  reportCount?: number;
  lastReportedAt?: string | null;
  distance?: number;
}

export interface ATMReport {
  id: string;
  atm_id: number;
  status: ATMStatus;
  device_hash: string;
  timestamp: string;
  trust_score: number;
  device_trust?: number;
}

export interface DeviceTrust {
  device_hash: string;
  total_reports: number;
  accurate_reports: number;
  trust_score: number;
  last_report: string;
}

export interface AdminStats {
  totalATMs: number;
  totalReports: number;
  statusCounts: Record<string, number>;
  activeDevices: number;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
