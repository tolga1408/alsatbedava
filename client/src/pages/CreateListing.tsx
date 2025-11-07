import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";

export default function CreateListing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    categoryId: 1, // Default to Emlak
    city: "",
    district: "",
    propertyType: "",
    rooms: "",
    size: "",
    images: [] as string[],
  });

  const createMutation = trpc.listings.create.useMutation({
    onSuccess: (data) => {
      toast.success("İlan başarıyla oluşturuldu!");
      setLocation(`/listing/${data.id}`);
    },
    onError: (error) => {
      toast.error("İlan oluşturulurken hata oluştu: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.price || !formData.city) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId,
      city: formData.city,
      district: formData.district || undefined,
      propertyType: formData.propertyType || undefined,
      rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
      size: formData.size ? parseFloat(formData.size) : undefined,
      images: formData.images.length > 0 ? formData.images : undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Giriş Yapın</CardTitle>
            <CardDescription>
              İlan vermek için giriş yapmanız gerekmektedir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full">Giriş Yap</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <a className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              Ana Sayfaya Dön
            </a>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Yeni İlan Oluştur</CardTitle>
            <CardDescription>
              Emlak ilanınızı oluşturun - Tamamen ücretsiz!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              <div className={`flex-1 text-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <p className="text-sm">Temel Bilgiler</p>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div className={`h-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
              </div>
              <div className={`flex-1 text-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <p className="text-sm">Detaylar</p>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div className={`h-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
              </div>
              <div className={`flex-1 text-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <p className="text-sm">Fotoğraflar</p>
              </div>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">İlan Başlığı *</Label>
                  <Input
                    id="title"
                    placeholder="Örn: Kadıköy'de Satılık 3+1 Daire"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    placeholder="İlanınız hakkında detaylı bilgi verin..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Fiyat (₺) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Şehir *</Label>
                    <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Şehir seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="İstanbul">İstanbul</SelectItem>
                        <SelectItem value="Ankara">Ankara</SelectItem>
                        <SelectItem value="İzmir">İzmir</SelectItem>
                        <SelectItem value="Bursa">Bursa</SelectItem>
                        <SelectItem value="Antalya">Antalya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="district">İlçe</Label>
                    <Input
                      id="district"
                      placeholder="İlçe"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={() => setStep(2)} className="w-full">
                  Devam Et
                </Button>
              </div>
            )}

            {/* Step 2: Property Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="propertyType">Emlak Tipi</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => setFormData({ ...formData, propertyType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Emlak tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daire">Daire</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Arsa">Arsa</SelectItem>
                      <SelectItem value="İşyeri">İşyeri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rooms">Oda Sayısı</Label>
                    <Select value={formData.rooms} onValueChange={(value) => setFormData({ ...formData, rooms: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Oda sayısı" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1+0</SelectItem>
                        <SelectItem value="2">1+1</SelectItem>
                        <SelectItem value="3">2+1</SelectItem>
                        <SelectItem value="4">3+1</SelectItem>
                        <SelectItem value="5">4+1</SelectItem>
                        <SelectItem value="6">5+1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="size">Metrekare (m²)</Label>
                    <Input
                      id="size"
                      type="number"
                      placeholder="0"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Geri
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Devam Et
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Fotoğraflar (Maksimum 10)</Label>
                  <ImageUpload
                    value={formData.images}
                    onChange={(urls) => setFormData({ ...formData, images: urls })}
                    maxImages={10}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Geri
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Oluşturuluyor..." : "İlanı Yayınla"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
