import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import {
  Home as HomeIcon,
  Car,
  Package,
  Building2,
  Search,
  CheckCircle2,
  Shield,
  Zap,
  Users,
  TrendingUp,
  MessageCircle,
  Phone,
  MapPin,
  Eye,
  Heart,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch recent listings for homepage
  const { data: recentListings } = trpc.listings.search.useQuery({
    limit: 6,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/browse?search=${encodeURIComponent(searchQuery)}`);
  };

  const categories = [
    {
      id: "emlak",
      name: "Emlak",
      subtitle: "Ev, Daire, Arsa",
      icon: HomeIcon,
      count: "12,847",
      active: true,
    },
    {
      id: "vasita",
      name: "Vasıta",
      subtitle: "Yakında",
      icon: Car,
      count: "Yakında",
      active: false,
    },
    {
      id: "ikinci-el",
      name: "İkinci El",
      subtitle: "Yakında",
      icon: Package,
      count: "Yakında",
      active: false,
    },
    {
      id: "diger",
      name: "Diğer",
      subtitle: "Yakında",
      icon: Building2,
      count: "Yakında",
      active: false,
    },
  ];

  const stats = [
    { label: "Aktif İlan", value: "12,847", icon: TrendingUp },
    { label: "Kayıtlı Kullanıcı", value: "45,231", icon: Users },
    { label: "Başarılı Satış", value: "3,421", icon: CheckCircle2 },
  ];

  const features = [
    {
      icon: CheckCircle2,
      title: "Tamamen Bedava",
      description:
        "Hiçbir komisyon, hiçbir ücret. İlan vermek ve almak tamamen ücretsiz.",
    },
    {
      icon: Shield,
      title: "Gerçek İlanlar",
      description:
        "Sahte ilanlarla savaşıyoruz. Her ilan doğrulanır ve gerçek kişilerden gelir.",
    },
    {
      icon: Zap,
      title: "Hızlı ve Kolay",
      description:
        "Modern arayüz, hızlı arama, anında iletişim. Sahibinden'den daha iyi.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            )}
            <span className="text-xl font-bold text-primary">
              {APP_TITLE}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse">
              <Button variant="ghost">İlanlar</Button>
            </Link>
            {user && (
              <>
                <Link href="/my-listings">
                  <Button variant="ghost">İlanlarım</Button>
                </Link>
                <Link href="/saved-searches">
                  <Button variant="ghost">Kayıtlı Aramalar</Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost">Mesajlar</Button>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <Button variant="ghost" disabled>
                Yükleniyor...
              </Button>
            ) : user ? (
              <>
                <Link href="/create-listing">
                  <Button>İlan Ver</Button>
                </Link>
                <span className="hidden md:inline text-sm text-muted-foreground">
                  Merhaba, {user.name || "Kullanıcı"}
                </span>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="outline">Giriş Yap</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button>İlan Ver</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Modern with Stats */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-16 md:py-24">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Badge */}
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Türkiye'nin adil pazarı
              </Badge>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Al, sat, komisyon ödeme —{" "}
                <span className="text-primary">hepsi bedava!</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Gerçek ilanlar, adil fiyatlar, sıfır komisyon. Sahibinden'e
                alternatif.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ne arıyorsunuz? (ev, araba, telefon...)"
                      className="pl-10 h-14 text-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 px-8">
                    Ara
                  </Button>
                </div>
              </form>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <stat.icon className="w-5 h-5" />
                      <span className="text-2xl md:text-3xl font-bold">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              Kategoriler
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.active ? `/browse?category=${category.id}` : "#"}
                >
                  <Card
                    className={`hover:shadow-lg transition-all ${
                      category.active
                        ? "cursor-pointer border-primary/20 hover:border-primary"
                        : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div
                        className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                          category.active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <category.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.subtitle}
                        </p>
                        <p className="text-sm font-medium text-primary mt-2">
                          {category.count} ilan
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        {recentListings && recentListings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Son İlanlar</h2>
                <Link href="/browse">
                  <Button variant="outline">Tümünü Gör</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentListings.map((listing) => (
                  <Link key={listing.id} href={`/listing/${listing.id}`}>
                    <Card className="hover:shadow-xl transition-all cursor-pointer h-full">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {listing.images && listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HomeIcon className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2">
                          Emlak
                        </Badge>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {listing.city}
                            {listing.district && `, ${listing.district}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-2xl font-bold text-primary">
                            {listing.price.toLocaleString("tr-TR")} ₺
                          </span>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>
                                {Math.floor(Math.random() * 500) + 50}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">
              Neden Alsatbedava?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardContent className="p-8 space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Hemen İlan Vermeye Başlayın
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Ücretsiz hesap oluşturun ve dakikalar içinde ilanınızı yayınlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/create-listing">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    İlan Ver
                  </Button>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button size="lg" variant="secondary" className="text-lg px-8">
                      Ücretsiz Kayıt Ol
                    </Button>
                  </a>
                  <Link href="/browse">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10"
                    >
                      İlanları İncele
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Alsatbedava</h3>
              <p className="text-sm">
                Türkiye'nin adil pazarı. Gerçek ilanlar, adil fiyatlar, sıfır
                komisyon.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Kategoriler</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/browse?category=emlak" className="hover:text-white">
                    Emlak
                  </Link>
                </li>
                <li className="text-gray-500">Vasıta (Yakında)</li>
                <li className="text-gray-500">İkinci El (Yakında)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Hakkımızda</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Biz Kimiz?
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    İletişim
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Yardım
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Yasal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Kullanım Koşulları
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Gizlilik Politikası
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2025 Alsatbedava.com - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
