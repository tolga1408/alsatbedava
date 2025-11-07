import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Home, MapPin, Plus } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function MyListings() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: myListings, isLoading: listingsLoading } = trpc.listings.search.useQuery(
    { status: "active" },
    { enabled: isAuthenticated }
  );

  const deleteMutation = trpc.listings.delete.useMutation({
    onSuccess: () => {
      toast.success("İlan silindi");
      utils.listings.search.invalidate();
    },
    onError: () => {
      toast.error("İlan silinirken hata oluştu");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Giriş Yapın</h2>
            <p className="text-gray-600 mb-6">
              İlanlarınızı görmek için giriş yapmanız gerekmektedir.
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full">Giriş Yap</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userListings = myListings?.filter((l) => l.userId === user?.id) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
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
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni İlan
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">İlanlarım</h1>
          <p className="text-gray-600">
            Tüm ilanlarınızı buradan yönetebilirsiniz
          </p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="active">Aktif İlanlar</TabsTrigger>
            <TabsTrigger value="sold">Satılanlar</TabsTrigger>
            <TabsTrigger value="draft">Taslaklar</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {listingsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <CardContent className="py-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map((listing) => {
                  const images = listing.images ? JSON.parse(listing.images) : [];
                  return (
                    <Card key={listing.id}>
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
                        <div className="text-2xl font-bold text-blue-600 mb-4">
                          {listing.price.toLocaleString('tr-TR')} ₺
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/listing/${listing.id}`}>
                            <a className="flex-1">
                              <Button variant="outline" className="w-full">
                                Görüntüle
                              </Button>
                            </a>
                          </Link>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              if (confirm("Bu ilanı silmek istediğinizden emin misiniz?")) {
                                deleteMutation.mutate({ id: listing.id });
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            Sil
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Henüz aktif ilanınız yok</p>
                  <Link href="/create-listing">
                    <a>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        İlk İlanınızı Oluşturun
                      </Button>
                    </a>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sold">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">Satılan ilan bulunmamaktadır</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draft">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">Taslak ilan bulunmamaktadır</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
