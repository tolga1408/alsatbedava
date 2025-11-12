import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Bell, BellOff, Search } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function SavedSearches() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: searches, isLoading } = trpc.savedSearches.list.useQuery();
  
  const deleteMutation = trpc.savedSearches.delete.useMutation({
    onSuccess: () => {
      utils.savedSearches.list.invalidate();
      toast.success("Kayıtlı arama silindi");
    },
    onError: () => {
      toast.error("Silme işlemi başarısız oldu");
    },
  });
  
  const toggleNotificationsMutation = trpc.savedSearches.toggleNotifications.useMutation({
    onSuccess: () => {
      utils.savedSearches.list.invalidate();
      toast.success("Bildirim ayarı güncellendi");
    },
  });

  const applySearch = (filters: any) => {
    // Navigate to browse page with filters
    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.categoryId) params.set("categoryId", filters.categoryId.toString());
    
    setLocation(`/browse?${params.toString()}`);
  };

  const formatFilters = (filters: any) => {
    const parts = [];
    if (filters.city) parts.push(`Şehir: ${filters.city}`);
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = `${filters.minPrice ? `${(filters.minPrice / 1000000).toFixed(1)}M` : "0"} - ${filters.maxPrice ? `${(filters.maxPrice / 1000000).toFixed(1)}M` : "∞"} ₺`;
      parts.push(`Fiyat: ${priceRange}`);
    }
    return parts.join(" • ") || "Tüm ilanlar";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Kayıtlı Aramalarım</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Kayıtlı Aramalarım</h1>
            <p className="text-muted-foreground mt-2">
              Arama kriterlerinizi kaydedin ve yeni ilanlardan haberdar olun
            </p>
          </div>
          <Button onClick={() => setLocation("/browse")} variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Yeni Arama
          </Button>
        </div>

        {!searches || searches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz kayıtlı arama yok</h3>
              <p className="text-muted-foreground mb-6">
                İlan arama sayfasında filtrelerinizi ayarlayın ve "Aramayı Kaydet" butonuna tıklayın
              </p>
              <Button onClick={() => setLocation("/browse")}>
                İlan Ara
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searches.map((search) => (
              <Card key={search.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{search.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {formatFilters(search.filters)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {search.emailNotifications ? (
                          <Bell className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <BellOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        <Switch
                          checked={!!search.emailNotifications}
                          onCheckedChange={(checked) => {
                            toggleNotificationsMutation.mutate({
                              id: search.id,
                              enabled: checked,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => applySearch(search.filters)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Aramayı Uygula
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (confirm("Bu aramayı silmek istediğinizden emin misiniz?")) {
                          deleteMutation.mutate({ id: search.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
