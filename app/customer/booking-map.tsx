"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Coordinates } from "@/lib/geo";

const originIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:oklch(0.17 0.01 90);border:3px solid oklch(1 0 0);box-shadow:0 1px 4px oklch(0.17 0.01 90 / 0.4);"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const destinationIcon = L.divIcon({
  className: "",
  html: `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0Z" fill="oklch(0.8 0.17 95)" stroke="oklch(0.17 0.01 90)" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="5.5" fill="oklch(0.17 0.01 90)"/>
    </svg>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

function RecenterOnChange({ center }: { center: Coordinates }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center.lat, center.lng, map]);

  return null;
}

function ClickToSetDestination({
  onSelect,
}: {
  onSelect: (point: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

export default function BookingMap({
  origin,
  destination,
  onSelectDestination,
}: {
  origin: Coordinates;
  destination: Coordinates | null;
  onSelectDestination: (point: Coordinates) => void;
}) {
  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={15}
      zoomControl={false}
      className="absolute inset-0 z-0 h-full w-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <RecenterOnChange center={origin} />
      <ClickToSetDestination onSelect={onSelectDestination} />
      <Marker position={[origin.lat, origin.lng]} icon={originIcon} />
      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
      )}
    </MapContainer>
  );
}
