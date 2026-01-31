import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import axios from "axios";

interface ATMElement {
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    operator?: string;
    brand?: string;
    "addr:street"?: string;
    "addr:city"?: string;
  };
}

interface OverpassResponse {
  elements: ATMElement[];
}

interface ATMReport {
  id: string;
  atm_id: number;
  status: string;
  device_hash: string;
  timestamp: string;
  trust_score: number;
}

interface DeviceTrust {
  device_hash: string;
  total_reports: number;
  accurate_reports: number;
  trust_score: number;
  last_report: string;
}

const atmReports: Map<number, ATMReport[]> = new Map();
const deviceTrust: Map<string, DeviceTrust> = new Map();

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

let cachedATMs: Map<string, { data: any[]; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const REPORT_DECAY_HOURS = 24;
const MIN_TRUST_SCORE = 0.3;
const DEFAULT_TRUST_SCORE = 0.5;
const MAX_TRUST_SCORE = 1.0;

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

function getDeviceTrustScore(deviceHash: string): number {
  const trust = deviceTrust.get(deviceHash);
  if (!trust) return DEFAULT_TRUST_SCORE;
  return trust.trust_score;
}

function updateDeviceTrust(deviceHash: string, wasAccurate: boolean): void {
  let trust = deviceTrust.get(deviceHash);
  
  if (!trust) {
    trust = {
      device_hash: deviceHash,
      total_reports: 0,
      accurate_reports: 0,
      trust_score: DEFAULT_TRUST_SCORE,
      last_report: new Date().toISOString(),
    };
  }

  trust.total_reports += 1;
  if (wasAccurate) {
    trust.accurate_reports += 1;
  }
  trust.last_report = new Date().toISOString();

  if (trust.total_reports >= 3) {
    const accuracy = trust.accurate_reports / trust.total_reports;
    trust.trust_score = Math.max(
      MIN_TRUST_SCORE,
      Math.min(MAX_TRUST_SCORE, accuracy * 0.7 + DEFAULT_TRUST_SCORE * 0.3)
    );
  }

  deviceTrust.set(deviceHash, trust);
}

function calculateWeightedStatus(atmId: number): { status: string; confidence: number; reportCount: number } {
  const reports = atmReports.get(atmId) || [];
  
  if (reports.length === 0) {
    return { status: "unknown", confidence: 0, reportCount: 0 };
  }

  const now = Date.now();
  const statusWeights: Record<string, number> = {
    working: 0,
    no_cash: 0,
    out_of_service: 0,
  };

  let totalWeight = 0;
  let validReports = 0;

  for (const report of reports) {
    const reportTime = new Date(report.timestamp).getTime();
    const hoursAgo = (now - reportTime) / (1000 * 60 * 60);

    if (hoursAgo > REPORT_DECAY_HOURS) continue;

    const timeDecay = Math.exp(-hoursAgo / 12);

    const trustWeight = report.trust_score;

    const weight = timeDecay * trustWeight;

    if (statusWeights[report.status] !== undefined) {
      statusWeights[report.status] += weight;
      totalWeight += weight;
      validReports++;
    }
  }

  if (totalWeight === 0) {
    return { status: "unknown", confidence: 0, reportCount: 0 };
  }

  let bestStatus = "unknown";
  let bestWeight = 0;

  for (const [status, weight] of Object.entries(statusWeights)) {
    if (weight > bestWeight) {
      bestWeight = weight;
      bestStatus = status;
    }
  }

  const confidence = Math.min(1, bestWeight / totalWeight);

  return { status: bestStatus, confidence, reportCount: validReports };
}

function getRecentReports(limit: number = 50): any[] {
  const allReports: ATMReport[] = [];
  
  for (const reports of atmReports.values()) {
    allReports.push(...reports);
  }

  return allReports
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
    .map((report) => ({
      ...report,
      device_trust: getDeviceTrustScore(report.device_hash),
    }));
}

function getATMStats(): any {
  let totalATMs = 0;
  let totalReports = 0;
  const statusCounts: Record<string, number> = {
    working: 0,
    no_cash: 0,
    out_of_service: 0,
    unknown: 0,
  };

  for (const [atmId, reports] of atmReports.entries()) {
    totalATMs++;
    totalReports += reports.length;
    const { status } = calculateWeightedStatus(atmId);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  return {
    totalATMs,
    totalReports,
    statusCounts,
    activeDevices: deviceTrust.size,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/atms/nearby", async (req: Request, res: Response) => {
    try {
      const { lat, lng, radius = "15000" } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ error: "lat and lng are required" });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const searchRadius = parseInt(radius as string, 10);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid lat or lng values" });
      }

      const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}_${searchRadius}`;
      const cached = cachedATMs.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        const atmsWithStatus = cached.data.map((atm) => {
          const { status, confidence, reportCount } = calculateWeightedStatus(atm.id);
          const reports = atmReports.get(atm.id) || [];
          const lastReport = reports.length > 0 
            ? reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
            : null;

          return {
            ...atm,
            status,
            confidence,
            reportCount,
            lastReportedAt: lastReport?.timestamp || null,
          };
        });
        return res.json(atmsWithStatus);
      }

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="atm"](around:${searchRadius},${latitude},${longitude});
          node["amenity"="bank"]["atm"="yes"](around:${searchRadius},${latitude},${longitude});
        );
        out body;
      `;

      const response = await axios.post<OverpassResponse>(
        OVERPASS_URL,
        query,
        {
          headers: { "Content-Type": "text/plain" },
          timeout: 30000,
        }
      );

      const atms = response.data.elements.map((element) => {
        const { status, confidence, reportCount } = calculateWeightedStatus(element.id);
        const reports = atmReports.get(element.id) || [];
        const lastReport = reports.length > 0 
          ? reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
          : null;

        const address = element.tags?.["addr:street"]
          ? `${element.tags["addr:street"]}${element.tags["addr:city"] ? ", " + element.tags["addr:city"] : ""}`
          : null;

        return {
          id: element.id,
          lat: element.lat,
          lng: element.lon,
          name: element.tags?.name || null,
          bank: element.tags?.operator || element.tags?.brand || null,
          address,
          status,
          confidence,
          reportCount,
          lastReportedAt: lastReport?.timestamp || null,
        };
      });

      cachedATMs.set(cacheKey, {
        data: atms.map((atm) => ({
          id: atm.id,
          lat: atm.lat,
          lng: atm.lng,
          name: atm.name,
          bank: atm.bank,
          address: atm.address,
        })),
        timestamp: Date.now(),
      });

      res.json(atms);
    } catch (error) {
      console.error("Error fetching ATMs:", error);
      res.status(500).json({ error: "Failed to fetch ATMs" });
    }
  });

  app.post("/api/report", async (req: Request, res: Response) => {
    try {
      const { atm_id, status, device_hash } = req.body;

      if (!atm_id || !status) {
        return res.status(400).json({ error: "atm_id and status are required" });
      }

      const validStatuses = ["working", "no_cash", "out_of_service", "unknown"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const deviceId = device_hash || "anonymous";
      const trustScore = getDeviceTrustScore(deviceId);

      const report: ATMReport = {
        id: generateId(),
        atm_id,
        status,
        device_hash: deviceId,
        timestamp: new Date().toISOString(),
        trust_score: trustScore,
      };

      const existingReports = atmReports.get(atm_id) || [];
      
      const deviceReportIndex = existingReports.findIndex(
        (r) => r.device_hash === deviceId
      );

      if (deviceReportIndex >= 0) {
        existingReports[deviceReportIndex] = report;
      } else {
        existingReports.push(report);
      }

      atmReports.set(atm_id, existingReports);

      const { status: weightedStatus, confidence } = calculateWeightedStatus(atm_id);

      console.log("ATM Report received:", { 
        ...report, 
        weighted_status: weightedStatus,
        confidence 
      });

      res.json({ 
        ok: true, 
        report,
        weighted_status: weightedStatus,
        confidence,
      });
    } catch (error) {
      console.error("Error saving report:", error);
      res.status(500).json({ error: "Failed to save report" });
    }
  });

  app.get("/api/reports/:atm_id", (req: Request, res: Response) => {
    const atmId = parseInt(req.params.atm_id, 10);

    if (isNaN(atmId)) {
      return res.status(400).json({ error: "Invalid ATM ID" });
    }

    const { status, confidence, reportCount } = calculateWeightedStatus(atmId);
    const reports = atmReports.get(atmId) || [];

    res.json({
      status,
      confidence,
      reportCount,
      reports: reports.map((r) => ({
        ...r,
        device_trust: getDeviceTrustScore(r.device_hash),
      })),
    });
  });

  app.get("/api/admin/stats", (_req: Request, res: Response) => {
    const stats = getATMStats();
    res.json(stats);
  });

  app.get("/api/admin/reports", (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const reports = getRecentReports(limit);
    res.json(reports);
  });

  app.get("/api/admin/devices", (_req: Request, res: Response) => {
    const devices = Array.from(deviceTrust.values())
      .sort((a, b) => b.total_reports - a.total_reports);
    res.json(devices);
  });

  app.post("/api/admin/verify-report", (req: Request, res: Response) => {
    const { report_id, is_accurate } = req.body;

    if (!report_id || is_accurate === undefined) {
      return res.status(400).json({ error: "report_id and is_accurate are required" });
    }

    for (const reports of atmReports.values()) {
      const report = reports.find((r) => r.id === report_id);
      if (report) {
        updateDeviceTrust(report.device_hash, is_accurate);
        return res.json({ ok: true, message: "Device trust updated" });
      }
    }

    res.status(404).json({ error: "Report not found" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
