import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ value = [], onChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const uploadMutation = trpc.upload.image.useMutation();

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      toast.error(`Maksimum ${maxImages} fotoğraf yükleyebilirsiniz`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} bir resim dosyası değil`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} çok büyük (max 5MB)`);
        }

        // Convert to base64
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64 = reader.result as string;
              const result = await uploadMutation.mutateAsync({
                base64,
                filename: file.name,
                mimeType: file.type,
              });
              resolve(result.url);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error(`${file.name} okunamadı`));
          reader.readAsDataURL(file);
        });
      });

      const urls = await Promise.all(uploadPromises);
      onChange([...value, ...urls]);
      toast.success(`${urls.length} fotoğraf yüklendi`);
    } catch (error: any) {
      toast.error(error.message || "Fotoğraf yüklenirken hata oluştu");
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxImages, uploadMutation]);

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Fotoğrafları sürükleyip bırakın veya tıklayın
        </p>
        <p className="text-sm text-gray-500">
          Maksimum {maxImages} fotoğraf, her biri max 5MB
        </p>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading}
        />
      </div>

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Fotoğraf ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Kapak
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-gray-600">
          Yükleniyor...
        </div>
      )}
    </div>
  );
}
