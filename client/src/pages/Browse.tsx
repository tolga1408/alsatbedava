import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Home, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Browse() {
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    categoryId: 1, // Emlak
  });

  const { data: listings, isLoading } = trpc.listings.search.useQuery({
    city: filters.city || undefined,
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
    categoryId: filters.categoryId,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AB</span>
                </div>
                <span className="font-bold text-xl">Alsatbedava</span>
              </a>
            </Link>

            <Link href="/create-listing">
              <a>
                <Button>İlan Ver</Button>
              </a>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="py-6 space-y-4">
                <h2 className="font-semibold text-lg mb-4">Filtreler</h2>

                {/* Search */}
                <div>
                  <Label htmlFor="search">Ara</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Anahtar kelime..."
                      className="pl-10"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="city">Şehir</Label>
                  <Select value={filters.city} onValueChange={(value) => setFilters({ ...filters, city: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm şehirler" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tüm şehirler</SelectItem>
                      <SelectItem value="İstanbul">İstanbul</SelectItem>
                      <SelectItem value="Ankara">Ankara</SelectItem>
                      <SelectItem value="İzmir">İzmir</SelectItem>
                      <SelectItem value="Bursa">Bursa</SelectItem>
                      <SelectItem value="Antalya">Antalya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label>Fiyat Aralığı (₺)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setFilters({ search: "", city: "", minPrice: "", maxPrice: "", categoryId: 1 })}
                >
                  Filtreleri Temizle
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Emlak İlanları</h1>
              <p className="text-gray-600">
                {isLoading ? "Yükleniyor..." : `${listings?.length || 0} ilan bulundu`}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <CardContent className="py-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => {
                  const images = listing.images ? JSON.parse(listing.images) : [];
                  return (
                    <Link key={listing.id} href={`/listing/${listing.id}`}>
                      <a>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                          <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                            {images.length > 0 ? (
                              <img
                                src={images[0]}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Home className="h-16 w-16 text-gray-300" />
                            )}
                          </div>
                          <CardContent className="py-4">
                            <h3 className="font-semibold mb-2 line-clamp-2">{listing.title}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                              <MapPin className="h-4 w-4" />
                              <span>{listing.city}{listing.district && `, ${listing.district}`}</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {listing.price.toLocaleString('tr-TR')} ₺
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Aradığınız kriterlere uygun ilan bulunamadı</p>
                  <Button onClick={() => setFilters({ search: "", city: "", minPrice: "", maxPrice: "", categoryId: 1 })}>
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
