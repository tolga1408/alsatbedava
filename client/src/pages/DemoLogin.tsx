import { startStaticDemoSession } from "@/lib/demoTrpcLink";
import { useEffect } from "react";
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

  useEffect(() => {
    startStaticDemoSession();
    setLocation(getSafeRedirect(), { replace: true });
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-muted-foreground">Giriş yapılıyor...</p>
    </div>
  );
}
