import { Platform } from "react-native";

const primaryColor = "#00A86B";
const primaryColorDark = "#00A86B";

export const Colors = {
  light: {
    text: "#212121",
    textSecondary: "#666666",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8E8E93",
    tabIconSelected: primaryColor,
    link: primaryColor,
    primary: primaryColor,
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F5F5F5",
    backgroundSecondary: "#EEEEEE",
    backgroundTertiary: "#E0E0E0",
    statusWorking: "#00A86B",
    statusNoCash: "#FF9500",
    statusOutOfService: "#FF3B30",
    statusUnknown: "#8E8E93",
    mapOverlay: "rgba(255, 255, 255, 0.95)",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#AAAAAA",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8E8E93",
    tabIconSelected: primaryColorDark,
    link: primaryColorDark,
    primary: primaryColorDark,
    backgroundRoot: "#121212",
    backgroundDefault: "#1E1E1E",
    backgroundSecondary: "#252525",
    backgroundTertiary: "#2C2C2C",
    statusWorking: "#00A86B",
    statusNoCash: "#FF9500",
    statusOutOfService: "#FF3B30",
    statusUnknown: "#8E8E93",
    mapOverlay: "rgba(30, 30, 30, 0.95)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
    fontFamily: "Cairo_700Bold",
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
    fontFamily: "Cairo_700Bold",
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: "Cairo_700Bold",
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
    fontFamily: "Cairo_700Bold",
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
    fontFamily: "Cairo_700Bold",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Cairo_400Regular",
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    fontFamily: "Cairo_400Regular",
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Cairo_400Regular",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Cairo_400Regular",
    bold: "Cairo_700Bold",
  },
  default: {
    sans: "Cairo_400Regular",
    bold: "Cairo_700Bold",
  },
  web: {
    sans: "Cairo_400Regular, system-ui, -apple-system, sans-serif",
    bold: "Cairo_700Bold, system-ui, -apple-system, sans-serif",
  },
});

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
};
