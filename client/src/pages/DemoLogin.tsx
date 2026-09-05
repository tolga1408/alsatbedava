import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { startStaticDemoSession } from "@/lib/demoTrpcLink";
import { useLocation } from "wouter";

const getSafeRedirect = () => {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "/";

  return redirect.startsWith("/") && !redirect.startsWith("//")
    ? redirect
    : "/";
};

export default function DemoLogin() {
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    startStaticDemoSession();
    setLocation(getSafeRedirect(), { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex items-center justify-center">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-12" />
            )}
          </div>
          <CardTitle>Demo hesabıyla giriş yap</CardTitle>
          <CardDescription>
            Şifre gerekmiyor. Test ilanları yalnızca bu tarayıcıda kalır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={handleContinue}>
            Demo hesabıyla devam et
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setLocation("/", { replace: true })}
          >
            Ana sayfaya dön
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
