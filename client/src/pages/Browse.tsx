import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Home,
  MapPin,
  Search,
  Eye,
  Heart,
  Phone,
  MessageCircle,
  SlidersHorizontal,
  X,
  Map,
  List,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { MapView } from "@/components/MapView";

export default function Browse() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("list");
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [highlightedListingId, setHighlightedListingId] = useState<number | null>(null);
  const boundsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listingRefs = useRef<Record<number, HTMLDivElement>>({});
  const [filters, setFilters] = useState({
    search: "",
    city: "all",
    minPrice: "",
    maxPrice: "",
    categoryId: 1, // Emlak
  });

  // Debounced bounds handler
  const handleBoundsChange = useCallback((bounds: { north: number; south: number; east: number; west: number }) => {
    if (!autoUpdate) return;
    
    // Clear existing timeout
    if (boundsTimeoutRef.current) {
      clearTimeout(boundsTimeoutRef.current);
    }
    
    // Set new timeout for debouncing
    boundsTimeoutRef.current = setTimeout(() => {
      setMapBounds(bounds);
    }, 500); // 500ms debounce
  }, [autoUpdate]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (boundsTimeoutRef.current) {
        clearTimeout(boundsTimeoutRef.current);
      }
    };
  }, []);
  
  // Handle marker click - highlight and scroll to listing
  const handleMarkerClick = useCallback((listingId: number) => {
    setHighlightedListingId(listingId);
    
    // Scroll to the listing card
    const listingElement = listingRefs.current[listingId];
    if (listingElement) {
      listingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedListingId(null);
    }, 3000);
  }, []);
  
  // Clear highlight when filters change
  useEffect(() => {
    setHighlightedListingId(null);
  }, [filters, viewMode]);

  const { data: listings, isLoading } = trpc.listings.search.useQuery({
    city: filters.city === "all" ? undefined : filters.city,
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
    categoryId: filters.categoryId,
    bounds: viewMode === "map" && autoUpdate && mapBounds ? mapBounds : undefined,
  });

  const turkishCities = [
    "İstanbul",
    "Ankara",
    "İzmir",
    "Bursa",
    "Antalya",
    "Adana",
    "Konya",
    "Gaziantep",
    "Şanlıurfa",
    "Mersin",
    "Kayseri",
    "Eskişehir",
    "Diyarbakır",
    "Samsun",
    "Denizli",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              {APP_LOGO && (
                <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
              )}
              <span className="text-xl font-bold text-primary">{APP_TITLE}</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtreler
            </Button>
            {user ? (
              <>
                <Link href="/my-listings">
                  <Button variant="ghost" size="sm">
                    İlanlarım
                  </Button>
                </Link>
                <Link href="/create-listing">
                  <Button size="sm">İlan Ver</Button>
                </Link>
              </>
            ) : (
              <Link href="/create-listing">
                <Button size="sm">İlan Ver</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Filtreler</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFilters({
                        search: "",
                        city: "",
                        minPrice: "",
                        maxPrice: "",
                        categoryId: 1,
                      })
                    }
                  >
                    Temizle
                  </Button>
                </div>

                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Arama</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Anahtar kelime..."
                      className="pl-10"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Select
                    value={filters.city}
                    onValueChange={(value) =>
                      setFilters({ ...filters, city: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm şehirler" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm şehirler</SelectItem>
                      {turkishCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Fiyat Aralığı (₺)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Quick Price Filters */}
                <div className="space-y-2">
                  <Label>Hızlı Fiyat Seçimi</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters({ ...filters, minPrice: "", maxPrice: "500000" })
                      }
                    >
                      500K'ya kadar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          minPrice: "500000",
                          maxPrice: "1000000",
                        })
                      }
                    >
                      500K - 1M
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          minPrice: "1000000",
                          maxPrice: "2000000",
                        })
                      }
                    >
                      1M - 2M
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters({ ...filters, minPrice: "2000000", maxPrice: "" })
                      }
                    >
                      2M+
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Filters Overlay */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-background lg:hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Filtreler</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-140px)]">
                {/* Same filters as desktop */}
                <div className="space-y-2">
                  <Label htmlFor="search-mobile">Arama</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-mobile"
                      placeholder="Anahtar kelime..."
                      className="pl-10"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city-mobile">Şehir</Label>
                  <Select
                    value={filters.city}
                    onValueChange={(value) =>
                      setFilters({ ...filters, city: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm şehirler" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm şehirler</SelectItem>
                      {turkishCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fiyat Aralığı (₺)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    setFilters({
                      search: "",
                      city: "all",
                      minPrice: "",
                      maxPrice: "",
                      categoryId: 1,
                    })
                  }
                >
                  Temizle
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setShowFilters(false)}
                >
                  Uygula
                </Button>
              </div>
            </div>
          )}

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Emlak İlanları</h1>
                <p className="text-muted-foreground">
                  {isLoading
                    ? "Yükleniyor..."
                    : `${listings?.length || 0} ilan bulundu`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {filters.city && (
                  <Badge variant="secondary" className="text-sm">
                    <MapPin className="w-3 h-3 mr-1" />
                    {filters.city}
                  </Badge>
                )}
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none"
                  >
                    <List className="w-4 h-4 mr-2" />
                    Liste
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                    className="rounded-none"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Harita
                  </Button>
                  <Button
                    variant={viewMode === "split" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("split")}
                    className="rounded-none"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h4m0-18v18m0-18h10a2 2 0 012 2v14a2 2 0 01-2 2h-10" />
                    </svg>
                    Bölünmüş
                  </Button>
                </div>
              </div>
            </div>

            {/* Split View */}
            {viewMode === "split" ? (
              <div className="space-y-4">
                {/* Auto-update toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto-update-split"
                      checked={autoUpdate}
                      onChange={(e) => setAutoUpdate(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="auto-update-split" className="text-sm font-medium cursor-pointer">
                      Haritayı hareket ettirdiğimde ilanları güncelle
                    </label>
                  </div>
                  {!autoUpdate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (mapBounds) {
                          setMapBounds({ ...mapBounds });
                        }
                      }}
                    >
                      Yenile
                    </Button>
                  )}
                </div>
                
                {/* Split layout: Map on left, List on right */}
                <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-320px)] min-h-[500px]">
                  {/* Map Panel */}
                  <div className="w-full lg:w-1/2 h-full">
                    {isLoading ? (
                      <Card className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Harita yükleniyor...</p>
                        </div>
                      </Card>
                    ) : (
                      <MapView
                        listings={listings || []}
                        onListingClick={handleMarkerClick}
                        onBoundsChange={handleBoundsChange}
                      />
                    )}
                  </div>
                  
                  {/* List Panel */}
                  <div className="w-full lg:w-1/2 h-full overflow-y-auto">
                    {isLoading ? (
                      <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map((i) => (
                          <Card key={i} className="animate-pulse">
                            <div className="aspect-video bg-muted" />
                            <CardContent className="p-4 space-y-3">
                              <div className="h-4 bg-muted rounded" />
                              <div className="h-4 bg-muted rounded w-2/3" />
                              <div className="h-6 bg-muted rounded w-1/2" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : listings && listings.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {listings.map((listing) => {
                          const images = listing.images ? JSON.parse(listing.images) : [];
                          const randomViews = Math.floor(Math.random() * 500) + 50;
                          const randomPhone = `0${Math.floor(Math.random() * 9) + 5}${Math.floor(Math.random() * 90000000) + 10000000}`;

                          return (
                            <Card
                              key={listing.id}
                              ref={(el) => {
                                if (el) {
                                  listingRefs.current[listing.id] = el;
                                }
                              }}
                              className={`hover:shadow-xl transition-all cursor-pointer group ${
                                highlightedListingId === listing.id
                                  ? 'ring-4 ring-primary ring-offset-2 shadow-2xl scale-105'
                                  : ''
                              }`}
                            >
                              <Link href={`/listing/${listing.id}`}>
                                <div className="aspect-video bg-muted relative overflow-hidden">
                                  {images.length > 0 ? (
                                    <img
                                      src={images[0]}
                                      alt={listing.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Home className="h-16 w-16 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 flex gap-2">
                                    <Badge className="bg-primary/90 backdrop-blur">
                                      Emlak
                                    </Badge>
                                  </div>
                                  <div className="absolute bottom-2 left-2">
                                    <Badge variant="secondary" className="bg-white/90 backdrop-blur">
                                      <Eye className="w-3 h-3 mr-1" />
                                      {randomViews}
                                    </Badge>
                                  </div>
                                </div>
                              </Link>
                              <CardContent className="p-4 space-y-3">
                                <Link href={`/listing/${listing.id}`}>
                                  <h3 className="font-semibold text-base line-clamp-2 hover:text-primary transition-colors">
                                    {listing.title}
                                  </h3>
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {listing.city}
                                    {listing.district && `, ${listing.district}`}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <div>
                                    <div className="text-2xl font-bold text-primary">
                                      {listing.price.toLocaleString("tr-TR")} ₺
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        window.open(`tel:${randomPhone}`);
                                      }}
                                    >
                                      <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 text-green-600"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        window.open(`https://wa.me/${randomPhone.replace(/^0/, '90')}`);
                                      }}
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <Card className="h-full flex items-center justify-center">
                        <CardContent className="text-center py-12">
                          <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">İlan bulunamadı</h3>
                          <p className="text-muted-foreground">Aradığınız kriterlere uygun ilan bulunamadı</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            ) : /* Map View */ viewMode === "map" ? (
              <div className="space-y-4">
                {/* Auto-update toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto-update"
                      checked={autoUpdate}
                      onChange={(e) => setAutoUpdate(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="auto-update" className="text-sm font-medium cursor-pointer">
                      Haritayı hareket ettirdiğimde ilanları güncelle
                    </label>
                  </div>
                  {!autoUpdate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (mapBounds) {
                          setMapBounds({ ...mapBounds });
                        }
                      }}
                    >
                      Yenile
                    </Button>
                  )}
                </div>
                <div className="h-[calc(100vh-320px)] min-h-[500px]">
                {isLoading ? (
                  <Card className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Harita yükleniyor...</p>
                    </div>
                  </Card>
                ) : (
                  <MapView
                    listings={listings || []}
                    onListingClick={handleMarkerClick}
                    onBoundsChange={handleBoundsChange}
                  />
                )}
                </div>
              </div>
            ) : /* List View */ isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-6 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {listings.map((listing) => {
                  const images = listing.images ? JSON.parse(listing.images) : [];
                  const randomViews = Math.floor(Math.random() * 500) + 50;
                  const randomPhone = `0${Math.floor(Math.random() * 9) + 5}${Math.floor(Math.random() * 90000000) + 10000000}`;

                  return (
                    <Card
                      key={listing.id}
                      ref={(el) => {
                        if (el) {
                          listingRefs.current[listing.id] = el;
                        }
                      }}
                      className={`hover:shadow-xl transition-all cursor-pointer group ${
                        highlightedListingId === listing.id
                          ? 'ring-4 ring-primary ring-offset-2 shadow-2xl scale-105'
                          : ''
                      }`}
                    >
                      <Link href={`/listing/${listing.id}`}>
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          {images.length > 0 ? (
                            <img
                              src={images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Home className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Badge className="bg-primary/90 backdrop-blur">
                              Emlak
                            </Badge>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-white/90 backdrop-blur">
                              <Eye className="w-3 h-3 mr-1" />
                              {randomViews}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                      <CardContent className="p-4 space-y-3">
                        <Link href={`/listing/${listing.id}`}>
                          <h3 className="font-semibold text-base line-clamp-2 hover:text-primary transition-colors">
                            {listing.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {listing.city}
                            {listing.district && `, ${listing.district}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <div className="text-2xl font-bold text-primary">
                              {listing.price.toLocaleString("tr-TR")} ₺
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                // TODO: Add to favorites
                              }}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `tel:${randomPhone}`;
                            }}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Ara
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.preventDefault();
                              setLocation(`/listing/${listing.id}`);
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Mesaj
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    İlan bulunamadı
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Aradığınız kriterlere uygun ilan bulunamadı
                  </p>
                  <Button
                    onClick={() =>
                      setFilters({
                        search: "",
                        city: "",
                        minPrice: "",
                        maxPrice: "",
                        categoryId: 1,
                      })
                    }
                  >
                    Filtreleri Temizle
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
