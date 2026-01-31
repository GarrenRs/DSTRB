# Cash Radar - Design Guidelines

## Brand Identity

**Purpose**: Help people find working ATMs instantly when they need cash urgently.

**Aesthetic Direction**: Emergency Utility — High contrast, instant clarity, nothing decorative. Think emergency hotline meets modern maps. The app must feel FAST and TRUSTWORTHY above all else.

**Memorable Element**: Color-coded ATM status system visible at a glance on the map. Green = working, Red = out of service, Orange = no cash, Gray = unknown.

**RTL Support**: Primary language is Arabic. All text, icons, and navigation must support RTL layout.

## Navigation Architecture

**Root Navigation**: Stack-only (no tabs). Single-purpose utility app.

**Screen Flow**:
1. Map Screen (default/home)
2. ATM Detail Modal (slides up from bottom)
3. Report Status Modal (slides up from ATM Detail)
4. List View (accessible via header button on Map)

## Screen Specifications

### 1. Map Screen
**Purpose**: Show user location and nearby ATMs at a glance.

**Layout**:
- **Header**: Transparent with blur effect
  - Left: Menu icon (settings/about)
  - Center: "أقرب صراف" (in Arabic)
  - Right: List view toggle button
- **Main Content**: Full-screen map
  - User location: Blue pulsing circle
  - ATM markers: Circular pins with bank logo or generic ATM icon, colored by status
- **Floating Elements**:
  - Recenter button (bottom-left, 16dp from edge and 96dp from bottom)
  - Search radius toggle (bottom-right, 16dp from edge and 96dp from bottom)

**Safe Area Insets**: 
- Top: insets.top + 8dp (transparent header)
- Bottom: insets.bottom + 80dp (space for floating buttons)

### 2. ATM Detail Modal
**Purpose**: Show ATM information and allow status reporting.

**Layout**:
- **Header**: Non-transparent white/dark surface
  - Left: Close (X) button
  - Center: Bank name or "صراف آلي"
- **Main Content**: Scrollable
  - Bank logo/icon (96dp circle, centered)
  - Distance from user (large, prominent)
  - Address (if available)
  - Last reported status with timestamp
  - "إبلاغ عن الحالة" button (primary, full-width)
  - "فتح في الخرائط" button (secondary, full-width)
- **Form**: N/A

**Safe Area Insets**:
- Top: 16dp (has opaque header)
- Bottom: insets.bottom + 24dp

### 3. Report Status Modal
**Purpose**: Quick status reporting with 4 options.

**Layout**:
- **Header**: Title only, no buttons ("إبلاغ عن حالة الصراف")
- **Main Content**: Non-scrollable, centered vertically
  - 4 large touch-target buttons in 2x2 grid:
    - "يعمل بشكل جيد" (green)
    - "لا يوجد نقد" (orange)
    - "خارج الخدمة" (red)
    - "إلغاء" (gray)
  - Each button: icon + text
- **Visual Feedback**: Button scales to 0.95 on press, shows success checkmark on submission

**Safe Area Insets**:
- Top/Bottom: 32dp

### 4. List View Screen
**Purpose**: Show sorted ATMs by distance when map is hard to read.

**Layout**:
- **Header**: Opaque
  - Left: Back arrow
  - Center: "أقرب الصرافات"
  - Right: Map toggle button
- **Main Content**: Scrollable list
  - Each item: Bank icon/logo (left), name + distance (center), status dot (right)
  - Dividers between items
- **Empty State**: "لا توجد صرافات قريبة" with illustration

**Safe Area Insets**:
- Top: 16dp (has opaque header)
- Bottom: insets.bottom + 16dp

## Color Palette

**Primary**: #00A86B (Emerald Green) - trustworthy, working ATMs
**Background**: #FFFFFF (Light), #121212 (Dark)
**Surface**: #F5F5F5 (Light), #1E1E1E (Dark)
**Text Primary**: #212121 (Light), #FFFFFF (Dark)
**Text Secondary**: #666666 (Light), #AAAAAA (Dark)

**Semantic Colors** (Status System):
- Success/Working: #00A86B
- Warning/No Cash: #FF9500
- Error/Out of Service: #FF3B30
- Unknown/Default: #8E8E93

## Typography

**Font**: Cairo (Google Font) — designed for Arabic, clean and modern
**Type Scale**:
- Display (ATM distance): Cairo Bold, 32sp
- Heading (screen titles): Cairo Bold, 24sp
- Body (details): Cairo Regular, 16sp
- Caption (timestamps): Cairo Regular, 14sp

## Visual Design

- ATM markers: Circular with subtle drop shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.15, shadowRadius: 3)
- Floating buttons: White/dark surface with drop shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- Status buttons: No shadow, solid fills with 12dp border radius
- All interactive elements: Opacity 0.6 on press OR scale to 0.95

## Generated Assets

**Required**:
1. **icon.png** - App icon: Green map pin with ATM symbol, gradient from #00A86B to darker emerald
2. **splash-icon.png** - Splash screen: Same as app icon
3. **empty-atms.png** - Empty state for list view: Simple illustration of a map with search icon (magnifying glass), muted emerald color, WHERE USED: List View empty state

**Recommended**:
4. **avatar-generic.png** - Generic bank icon for ATMs without logos: Square with rounded corners, gray background, "ATM" text, WHERE USED: Map markers and detail modal
5. **status-working.png** - Small green checkmark icon for working status, WHERE USED: ATM detail modal
6. **status-nocash.png** - Orange cash icon with X, WHERE USED: ATM detail modal
7. **status-outofservice.png** - Red X icon, WHERE USED: ATM detail modal