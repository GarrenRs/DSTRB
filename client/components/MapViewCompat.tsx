import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE as PROVIDER } from "react-native-maps";

interface MapViewCompatProps {
  children?: React.ReactNode;
  style?: any;
  [key: string]: any;
}

export const MapViewCompat = React.forwardRef<MapView, MapViewCompatProps>(
  (props, ref) => {
    return <MapView ref={ref} {...props} />;
  }
);

MapViewCompat.displayName = "MapViewCompat";

export function MarkerCompat(props: any) {
  return <Marker {...props} />;
}

export const PROVIDER_GOOGLE = PROVIDER;
