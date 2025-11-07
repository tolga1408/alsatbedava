import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "./ui/card";
import { MapPin } from "lucide-react";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Listing {
  id: number;
  title: string;
  price: number;
  city: string;
  district: string | null;
  images: string | null;
}

interface MapViewProps {
  listings: Listing[];
  onListingClick?: (listingId: number) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

// Turkish city coordinates (approximate centers)
const CITY_COORDINATES: Record<string, [number, number]> = {
  İstanbul: [41.0082, 28.9784],
  Ankara: [39.9334, 32.8597],
  İzmir: [38.4237, 27.1428],
  Bursa: [40.1826, 29.0665],
  Antalya: [36.8969, 30.7133],
  Adana: [37.0, 35.3213],
  Konya: [37.8746, 32.4932],
  Gaziantep: [37.0662, 37.3833],
  Şanlıurfa: [37.1591, 38.7969],
  Mersin: [36.8121, 34.6415],
  Kayseri: [38.7205, 35.4826],
  Eskişehir: [39.7767, 30.5206],
  Diyarbakır: [37.9144, 40.2306],
  Samsun: [41.2867, 36.33],
  Denizli: [37.7765, 29.0864],
};

export function MapView({ listings, onListingClick, onBoundsChange }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([39.0, 35.0], 6); // Center of Turkey

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Listen for map move events
      if (onBoundsChange) {
        map.on('moveend', () => {
          const bounds = map.getBounds();
          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        });
      }

      mapInstanceRef.current = map;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const map = mapInstanceRef.current;

    // Add markers for listings
    const bounds: L.LatLngBoundsExpression = [];
    
    listings.forEach((listing) => {
      const coords = CITY_COORDINATES[listing.city];
      if (!coords) return;

      // Add slight random offset for listings in same city
      const lat = coords[0] + (Math.random() - 0.5) * 0.1;
      const lng = coords[1] + (Math.random() - 0.5) * 0.1;

      bounds.push([lat, lng]);

      // Create custom icon with price
      const priceIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div class="flex flex-col items-center">
            <div class="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap">
              ${listing.price.toLocaleString("tr-TR")} ₺
            </div>
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary"></div>
          </div>
        `,
        iconSize: [120, 40],
        iconAnchor: [60, 40],
      });

      const marker = L.marker([lat, lng], { icon: priceIcon }).addTo(map);

      // Create popup content
      const images = listing.images ? JSON.parse(listing.images) : [];
      const popupContent = `
        <div class="min-w-[250px]">
          ${
            images.length > 0
              ? `<img src="${images[0]}" alt="${listing.title}" class="w-full h-32 object-cover rounded-t-lg mb-2" />`
              : ""
          }
          <h3 class="font-semibold text-sm mb-1 line-clamp-2">${listing.title}</h3>
          <p class="text-xs text-muted-foreground mb-2">
            <span class="inline-flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              ${listing.city}${listing.district ? `, ${listing.district}` : ""}
            </span>
          </p>
          <p class="text-lg font-bold text-primary">${listing.price.toLocaleString("tr-TR")} ₺</p>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle marker click
      marker.on("click", () => {
        if (onListingClick) {
          onListingClick(listing.id);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }

    return () => {
      // Cleanup markers on unmount
      markersRef.current.forEach((marker) => marker.remove());
    };
  }, [listings, onListingClick]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      {listings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <Card className="p-8 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Haritada gösterilecek ilan bulunamadı
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
