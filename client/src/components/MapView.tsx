import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
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
  latitude: string | null;
  longitude: string | null;
  images: string | null;
}

interface MapViewProps {
  listings: Listing[];
  onListingClick?: (listingId: number) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

// Component to handle bounds changes
function BoundsHandler({ onBoundsChange }: { onBoundsChange?: (bounds: any) => void }) {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    },
  });
  return null;
}

// Component to fit bounds to markers
function FitBounds({ listings }: { listings: Listing[] }) {
  const map = useMap();

  useEffect(() => {
    const validListings = listings.filter(l => l.latitude && l.longitude);
    if (validListings.length > 0) {
      const bounds: L.LatLngBoundsExpression = validListings.map(l => [
        parseFloat(l.latitude!),
        parseFloat(l.longitude!)
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [listings, map]);

  return null;
}

export function MapView({ listings, onListingClick, onBoundsChange }: MapViewProps) {
  const [key, setKey] = useState(0);

  // Force re-render when listings change significantly
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [listings.length]);

  // Filter listings with valid coordinates
  const validListings = listings.filter(l => l.latitude && l.longitude);

  // Create custom price marker icon
  const createPriceIcon = (price: number) => {
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div class="flex flex-col items-center">
          <div class="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap">
            ${price.toLocaleString("tr-TR")} ₺
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary"></div>
        </div>
      `,
      iconSize: [120, 40],
      iconAnchor: [60, 40],
    });
  };

  return (
    <div className="relative w-full h-full">
      {validListings.length > 0 ? (
        <MapContainer
          key={key}
          center={[39.0, 35.0]}
          zoom={6}
          style={{ width: "100%", height: "100%" }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          
          <BoundsHandler onBoundsChange={onBoundsChange} />
          <FitBounds listings={validListings} />

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            iconCreateFunction={(cluster: any) => {
              const count = cluster.getChildCount();
              return L.divIcon({
                html: `<div class="flex items-center justify-center w-full h-full">
                  <span class="text-white font-bold text-sm">${count}</span>
                </div>`,
                className: "custom-cluster-icon bg-primary rounded-full shadow-lg",
                iconSize: L.point(40, 40),
              });
            }}
          >
            {validListings.map((listing) => {
              const lat = parseFloat(listing.latitude!);
              const lng = parseFloat(listing.longitude!);
              const images = listing.images ? JSON.parse(listing.images) : [];

              return (
                <Marker
                  key={listing.id}
                  position={[lat, lng]}
                  icon={createPriceIcon(listing.price)}
                  eventHandlers={{
                    click: () => {
                      if (onListingClick) {
                        onListingClick(listing.id);
                      }
                    },
                  }}
                >
                  <Popup>
                    <div className="min-w-[250px]">
                      {images.length > 0 && (
                        <img
                          src={images[0]}
                          alt={listing.title}
                          className="w-full h-32 object-cover rounded-t-lg mb-2"
                        />
                      )}
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listing.city}
                          {listing.district && `, ${listing.district}`}
                        </span>
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {listing.price.toLocaleString("tr-TR")} ₺
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
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
