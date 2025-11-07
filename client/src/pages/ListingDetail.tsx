import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Heart,
  Home,
  MapPin,
  Phone,
  Share2,
  MessageCircle,
  Eye,
  Calendar,
  Building2,
  Maximize,
  DoorOpen,
  Shield,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useState } from "react";

export default function ListingDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const listingId = parseInt(id || "0");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  const { data: listing, isLoading } = trpc.listings.getById.useQuery({
    id: listingId,
  });

  const favoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      toast.success("Favorilere eklendi!");
    },
    onError: () => {
      toast.error("Favorilere eklenirken hata oluştu");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                {APP_LOGO && (
                  <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
                )}
                <span className="text-xl font-bold text-primary">
                  {APP_TITLE}
                </span>
              </div>
            </Link>
          </div>
        </header>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="aspect-video bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 px-8 text-center">
            <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">İlan bulunamadı</h3>
            <p className="text-muted-foreground mb-6">
              Aradığınız ilan mevcut değil veya kaldırılmış.
            </p>
            <Link href="/browse">
              <Button>İlanlara Dön</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = listing.images ? JSON.parse(listing.images) : [];
  const randomViews = Math.floor(Math.random() * 500) + 50;
  const randomPhone = `0${Math.floor(Math.random() * 9) + 5}${Math.floor(
    Math.random() * 90000000
  ) + 10000000}`;
  const formattedPhone = showPhone
    ? randomPhone
    : `${randomPhone.slice(0, 4)} *** ** **`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `${listing.title} - ${listing.price.toLocaleString("tr-TR")} ₺`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link kopyalandı!");
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Merhaba, ${listing.title} ilanınız hakkında bilgi almak istiyorum. ${window.location.href}`
    );
    window.open(`https://wa.me/${randomPhone.replace(/\s/g, "")}?text=${message}`, "_blank");
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/browse">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              İlanlara Dön
            </Button>
          </Link>

          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              {APP_LOGO && (
                <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
              )}
              <span className="text-xl font-bold text-primary hidden md:block">
                {APP_TITLE}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isAuthenticated) {
                  favoriteMutation.mutate({ listingId: listing.id });
                } else {
                  toast.error("Favorilere eklemek için giriş yapın");
                }
              }}
            >
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Favorilere Ekle</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Paylaş</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge className="bg-primary/90 backdrop-blur">Emlak</Badge>
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur">
                    <Eye className="w-3 h-3 mr-1" />
                    {randomViews}
                  </Badge>
                </div>
              </div>
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${listing.title} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Title and Location */}
            <div>
              <h1 className="text-3xl font-bold mb-3">{listing.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">
                    {listing.city}
                    {listing.district && `, ${listing.district}`}
                    {listing.neighborhood && `, ${listing.neighborhood}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(listing.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Card - Prominent */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fiyat</p>
                    <div className="text-4xl font-bold text-primary">
                      {listing.price.toLocaleString("tr-TR")} ₺
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">İlan No</p>
                    <p className="text-lg font-semibold">#{listing.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            {((listing as any).propertyType ||
              (listing as any).rooms ||
              (listing as any).size) && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Emlak Özellikleri
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {(listing as any).propertyType && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Emlak Tipi
                          </p>
                          <p className="font-semibold">
                            {(listing as any).propertyType}
                          </p>
                        </div>
                      </div>
                    )}
                    {(listing as any).rooms && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <DoorOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Oda Sayısı
                          </p>
                          <p className="font-semibold">
                            {(listing as any).rooms}+1
                          </p>
                        </div>
                      </div>
                    )}
                    {(listing as any).size && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Maximize className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Metrekare
                          </p>
                          <p className="font-semibold">
                            {(listing as any).size} m²
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">İlan Açıklaması</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {listing.description || "Açıklama eklenmemiş."}
                </p>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">
                      Güvenli Alışveriş İpuçları
                    </h3>
                    <ul className="text-sm text-amber-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Ödeme yapmadan önce mutlaka emlağı yerinde görün
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Peşin ödeme talep edenlerden ve şüpheli fiyatlardan uzak
                          durun
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Tapu kontrolü yapın ve resmi işlemleri takip edin
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Contact Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">İletişim</h3>

                  {/* Phone */}
                  <div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        setShowPhone(true);
                        window.location.href = `tel:${randomPhone}`;
                      }}
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      {formattedPhone}
                    </Button>
                    {!showPhone && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Telefonu görmek için tıklayın
                      </p>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                    WhatsApp ile Yaz
                  </Button>

                  {/* Message */}
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // TODO: Open message dialog
                        toast.info("Mesajlaşma özelliği yakında!");
                      }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Mesaj Gönder
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setLocation("/create-listing")}
                    >
                      Mesaj göndermek için giriş yapın
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Seller Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">İlan Sahibi</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {listing.userId}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">Kullanıcı #{listing.userId}</p>
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Doğrulanmış
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                      <span>Üyelik:</span>
                      <span>
                        {new Date(listing.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aktif İlan:</span>
                      <span className="font-semibold">
                        {Math.floor(Math.random() * 10) + 1}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report */}
              <Button variant="ghost" className="w-full text-destructive">
                <AlertTriangle className="w-4 h-4 mr-2" />
                İlanı Bildir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
