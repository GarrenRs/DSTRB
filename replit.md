# Cash Radar - ATM Locator App

## Overview
Cash Radar is a mobile app that helps users find the nearest working ATMs. The app shows ATMs on a map with color-coded status indicators and allows users to report the current status of ATMs.

## Current State
- **Version**: 1.1.0
- **Status**: Functional with weighted status system
- **Last Updated**: January 2026

## Features
- Map view showing nearby ATMs with status indicators
- List view sorted by distance
- ATM status reporting (working, no cash, out of service)
- **Weighted Status System**: Calculates ATM status based on multiple reports with time decay
- **Trust Algorithm**: Device reliability scoring based on report accuracy
- **Admin Panel**: View stats, recent reports, and device trust scores
- RTL Arabic interface
- Location-based search using OpenStreetMap Overpass API

## Project Architecture

### Frontend (Expo React Native)
- **Entry**: `client/App.tsx`
- **Navigation**: Stack-only navigation (no tabs)
- **Screens**:
  - `MapScreen` - Main map with ATM markers
  - `ListScreen` - List view of ATMs sorted by distance
  - `ATMDetailModal` - ATM details with confidence level
  - `ReportStatusModal` - Status reporting interface
  - `AdminScreen` - Admin panel for stats and management

### Backend (Express)
- **Entry**: `server/index.ts`
- **Routes**: `server/routes.ts`
  - `GET /api/atms/nearby` - Fetch nearby ATMs with weighted status
  - `POST /api/report` - Submit ATM status report
  - `GET /api/reports/:atm_id` - Get status for specific ATM
  - `GET /api/admin/stats` - Get overall statistics
  - `GET /api/admin/reports` - Get recent reports
  - `GET /api/admin/devices` - Get device trust scores
  - `POST /api/admin/verify-report` - Verify report accuracy

### Weighted Status Algorithm
- Reports decay over 24 hours (exponential decay)
- Device trust score weights each report (0.3 - 1.0)
- Confidence level calculated based on agreement between reports
- Default trust score: 0.5
- Trust score updates based on verified accuracy

### Key Libraries
- react-native-maps (1.18.0)
- expo-location
- @expo-google-fonts/cairo
- @tanstack/react-query

## Color System (Status)
- Working: #00A86B (Emerald Green)
- No Cash: #FF9500 (Orange)
- Out of Service: #FF3B30 (Red)
- Unknown: #8E8E93 (Gray)

## User Preferences
- Primary language: Arabic
- RTL layout enabled
- Cairo font for Arabic text

## Running the App
1. Backend: `npm run server:dev` (port 5000)
2. Frontend: `npm run expo:dev` (port 8081)
3. Scan QR code in Expo Go to test on device
4. Access admin panel via settings icon on map screen
