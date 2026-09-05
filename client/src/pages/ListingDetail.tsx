import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Heart,
  Home,
  MapPin,
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
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useState } from "react";
import { getCategoryName } from "@/lib/categoryOptions";
import { getListingImages } from "@/lib/listingImages";

export default function ListingDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const listingId = parseInt(id || "0");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("fraud");
  const [reportDescription, setReportDescription] = useState("");

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

  const messageMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      toast.success("Mesaj gönderildi");
      setMessage("");
      setMessageOpen(false);
      setLocation("/messages");
    },
    onError: error => toast.error(error.message),
  });

  const reportMutation = trpc.reports.create.useMutation({
    onSuccess: () => {
      toast.success("Bildiriminiz incelemeye alındı");
      setReportDescription("");
      setReportOpen(false);
    },
    onError: error => toast.error(error.message),
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

  const images = getListingImages(listing.images);
  const categoryName = getCategoryName(listing.categoryId);
  const isSampleListing = listing.id >= 30005 && listing.id <= 30014;
  const isOwnListing = user?.id === listing.userId;

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

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
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
                  <Badge className="bg-primary/90 backdrop-blur">
                    {categoryName}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-white/90 backdrop-blur"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {listing.viewCount}
                  </Badge>
                  {isSampleListing && (
                    <Badge variant="secondary">Örnek beta ilanı</Badge>
                  )}
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
                    {categoryName} Özellikleri
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {(listing as any).propertyType && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            İlan Tipi
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
                          Ürünü görmeden veya doğrulamadan ödeme yapmayın
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Peşin ödeme talep edenlerden ve şüpheli fiyatlardan
                          uzak durun
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Şüpheli ilanları bildirin; kişisel bilgilerinizi
                          paylaşmayın
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

                  {isSampleListing ? (
                    <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
                      Bu ilan yalnızca beta özelliklerini göstermek için
                      hazırlanmıştır. Örnek satıcıya mesaj gönderilemez.
                    </div>
                  ) : isOwnListing ? (
                    <Link href="/my-listings">
                      <Button className="w-full" size="lg">
                        İlanımı yönet
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        if (!isAuthenticated) {
                          window.location.href = getLoginUrl();
                          return;
                        }
                        setMessageOpen(true);
                      }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Satıcıya mesaj gönder
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
                      <p className="font-semibold">
                        {isSampleListing
                          ? "Örnek satıcı"
                          : `Kullanıcı #${listing.userId}`}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {isSampleListing ? "Demo içerik" : "Beta hesabı"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                      <span>Üyelik:</span>
                      <span>
                        {new Date(listing.createdAt).toLocaleDateString(
                          "tr-TR"
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report */}
              {!isOwnListing && !isSampleListing && (
                <Button
                  variant="ghost"
                  className="w-full text-destructive"
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.location.href = getLoginUrl();
                      return;
                    }
                    setReportOpen(true);
                  }}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  İlanı bildir
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Satıcıya mesaj gönder</DialogTitle>
            <DialogDescription>{listing.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="listing-message">Mesajınız</Label>
            <Textarea
              id="listing-message"
              value={message}
              onChange={event => setMessage(event.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Ürünün durumu ve teslimat seçenekleri hakkında bilgi almak istiyorum."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageOpen(false)}>
              Vazgeç
            </Button>
            <Button
              onClick={() =>
                messageMutation.mutate({
                  listingId: listing.id,
                  receiverId: listing.userId,
                  content: message,
                })
              }
              disabled={
                message.trim().length === 0 || messageMutation.isPending
              }
            >
              {messageMutation.isPending ? "Gönderiliyor..." : "Mesaj gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İlanı bildir</DialogTitle>
            <DialogDescription>
              Bildiriminiz inceleme sırasında ilan sahibine gösterilmez.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Neden</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger id="report-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fraud">Şüpheli veya yanıltıcı</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Uygunsuz içerik</SelectItem>
                  <SelectItem value="sold">
                    Satılmış veya mevcut değil
                  </SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-description">
                Açıklama (isteğe bağlı)
              </Label>
              <Textarea
                id="report-description"
                value={reportDescription}
                onChange={event => setReportDescription(event.target.value)}
                rows={4}
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                reportMutation.mutate({
                  listingId: listing.id,
                  reason: reportReason as
                    | "spam"
                    | "fraud"
                    | "inappropriate"
                    | "sold"
                    | "other",
                  description: reportDescription || undefined,
                })
              }
              disabled={reportMutation.isPending}
            >
              {reportMutation.isPending
                ? "Gönderiliyor..."
                : "Bildirimi gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
