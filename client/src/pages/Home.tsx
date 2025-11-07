import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, Car, Home, Package, Search, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { data: featuredListings, isLoading } = trpc.listings.search.useQuery({
    status: 'active',
    limit: 6,
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Alsatbedava</h1>
                <p className="text-xs text-gray-600">Al, sat, komisyon ödeme — hepsi bedava!</p>
              </div>
            </a>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/browse">
                  <a>
                    <Button variant="ghost">İlanlar</Button>
                  </a>
                </Link>
                <Link href="/my-listings">
                  <a>
                    <Button variant="ghost">İlanlarım</Button>
                  </a>
                </Link>
                <Link href="/create-listing">
                  <a>
                    <Button>İlan Ver</Button>
                  </a>
                </Link>
                <span className="text-sm text-gray-700">Merhaba, {user?.name}</span>
              </>
            ) : (
              <>
                <Link href="/browse">
                  <a>
                    <Button variant="ghost">İlanlar</Button>
                  </a>
                </Link>
                <a href={getLoginUrl()}>
                  <Button variant="outline">Giriş Yap</Button>
                </a>
                <Link href="/create-listing">
                  <a>
                    <Button>İlan Ver</Button>
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Türkiye'nin Adil Pazarı
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Gerçek ilanlar, adil fiyatlar, sıfır komisyon. Sahibinden'e alternatif.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex gap-2 max-w-2xl mx-auto">
              <Input
                placeholder="Ne arıyorsunuz? (ev, araba, telefon...)"
                className="border-0 focus-visible:ring-0"
              />
              <Link href="/browse">
                <a>
                  <Button size="lg" className="text-lg px-8">
                    <Search className="h-5 w-5 mr-2" />
                    Ara
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-6 text-center">Kategoriler</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link href="/category/emlak">
              <a>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Home className="h-12 w-12 text-blue-600 mb-3" />
                    <h4 className="font-semibold">Emlak</h4>
                    <p className="text-sm text-gray-600">Ev, Daire, Arsa</p>
                  </CardContent>
                </Card>
              </a>
            </Link>

            <Card className="opacity-50">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Car className="h-12 w-12 text-gray-400 mb-3" />
                <h4 className="font-semibold text-gray-600">Vasıta</h4>
                <p className="text-sm text-gray-500">Yakında</p>
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Package className="h-12 w-12 text-gray-400 mb-3" />
                <h4 className="font-semibold text-gray-600">İkinci El</h4>
                <p className="text-sm text-gray-500">Yakında</p>
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Building2 className="h-12 w-12 text-gray-400 mb-3" />
                <h4 className="font-semibold text-gray-600">Diğer</h4>
                <p className="text-sm text-gray-500">Yakında</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-6">Son İlanlar</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : featuredListings && featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <Link key={listing.id} href={`/listing/${listing.id}`}>
                  <a>
                    <Card className="hover:shadow-lg transition-shadow">
                      <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        {listing.images ? (
                          <img
                            src={JSON.parse(listing.images)[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        ) : (
                          <Home className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">{listing.title}</CardTitle>
                        <CardDescription>
                          <span className="text-xl font-bold text-blue-600">
                            {listing.price.toLocaleString('tr-TR')} ₺
                          </span>
                          <br />
                          <span className="text-sm">{listing.city}</span>
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">Henüz ilan yok. İlk ilanı siz verin!</p>
                <Link href="/create-listing">
                  <a>
                    <Button className="mt-4">İlan Ver</Button>
                  </a>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8 text-center">Neden Alsatbedava?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                0₺
              </div>
              <h4 className="font-semibold mb-2">Tamamen Bedava</h4>
              <p className="text-gray-600">Hiçbir komisyon, hiçbir ücret. İlan vermek ve almak tamamen ücretsiz.</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                ✓
              </div>
              <h4 className="font-semibold mb-2">Gerçek İlanlar</h4>
              <p className="text-gray-600">Sahte ilan yok. Her ilan doğrulanır ve gerçek kişilerden gelir.</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                ⚡
              </div>
              <h4 className="font-semibold mb-2">Hızlı ve Kolay</h4>
              <p className="text-gray-600">Modern arayüz, hızlı arama, anında iletişim. Sahibinden'den daha iyi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-bold mb-4">Alsatbedava</h5>
              <p className="text-gray-400 text-sm">
                Türkiye'nin adil pazarı. Gerçek ilanlar, adil fiyatlar, sıfır komisyon.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Kategoriler</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/category/emlak"><a className="hover:text-white">Emlak</a></Link></li>
                <li className="opacity-50">Vasıta (Yakında)</li>
                <li className="opacity-50">İkinci El (Yakında)</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Hakkımızda</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Biz Kimiz?</a></li>
                <li><a href="#" className="hover:text-white">İletişim</a></li>
                <li><a href="#" className="hover:text-white">Yardım</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Yasal</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Kullanım Koşulları</a></li>
                <li><a href="#" className="hover:text-white">Gizlilik Politikası</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 Alsatbedava.com - Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
