import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Heart, Home, MapPin, Phone, Share2 } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function ListingDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const listingId = parseInt(id || "0");

  const { data: listing, isLoading } = trpc.listings.getById.useQuery({ id: listingId });

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
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-6" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
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
            <p className="text-gray-600 mb-4">İlan bulunamadı</p>
            <Link href="/">
              <a>
                <Button>Ana Sayfaya Dön</Button>
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = listing.images ? JSON.parse(listing.images) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <a className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              Geri
            </a>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Home className="h-24 w-24 text-gray-400" />
              )}
            </div>

            {/* Title and Actions */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.city}{listing.district && `, ${listing.district}`}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (isAuthenticated) {
                      favoriteMutation.mutate({ listingId: listing.id });
                    } else {
                      toast.error("Favorilere eklemek için giriş yapın");
                    }
                  }}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Price */}
            <Card>
              <CardContent className="py-6">
                <div className="text-4xl font-bold text-blue-600">
                  {listing.price.toLocaleString('tr-TR')} ₺
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            {((listing as any).propertyType || (listing as any).rooms || (listing as any).size) && (
              <Card>
                <CardContent className="py-6">
                  <h2 className="text-xl font-semibold mb-4">Emlak Özellikleri</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {(listing as any).propertyType && (
                      <div>
                        <p className="text-sm text-gray-600">Emlak Tipi</p>
                        <p className="font-semibold">{(listing as any).propertyType}</p>
                      </div>
                    )}
                    {(listing as any).rooms && (
                      <div>
                        <p className="text-sm text-gray-600">Oda Sayısı</p>
                        <p className="font-semibold">{(listing as any).rooms}+1</p>
                      </div>
                    )}
                    {(listing as any).size && (
                      <div>
                        <p className="text-sm text-gray-600">Metrekare</p>
                        <p className="font-semibold">{(listing as any).size} m²</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardContent className="py-6">
                <h2 className="text-xl font-semibold mb-4">Açıklama</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.description || "Açıklama eklenmemiş."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="py-6">
                <h3 className="font-semibold mb-4">İletişim</h3>
                <Button className="w-full mb-3">
                  <Phone className="h-4 w-4 mr-2" />
                  Telefonu Göster
                </Button>
                <Button variant="outline" className="w-full">
                  Mesaj Gönder
                </Button>
              </CardContent>
            </Card>

            {/* Listing Info */}
            <Card>
              <CardContent className="py-6">
                <h3 className="font-semibold mb-4">İlan Bilgileri</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">İlan No:</span>
                    <span className="font-semibold">#{listing.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yayınlanma:</span>
                    <span>{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Görüntülenme:</span>
                    <span>{listing.viewCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="py-6">
                <h3 className="font-semibold mb-2 text-yellow-900">Güvenlik İpuçları</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Ödeme yapmadan önce mutlaka emlağı görün</li>
                  <li>• Peşin ödeme talep edenlerden uzak durun</li>
                  <li>• Şüpheli ilanları bildirin</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
