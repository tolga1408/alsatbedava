import {
  Armchair,
  Car,
  Home as HomeIcon,
  Package,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export type ListingCategory = {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  demoCount: number;
  icon: LucideIcon;
};

export const LISTING_CATEGORIES: ListingCategory[] = [
  {
    id: 1,
    slug: "emlak",
    name: "Emlak",
    subtitle: "Ev, daire, arsa",
    demoCount: 5,
    icon: HomeIcon,
  },
  {
    id: 2,
    slug: "vasita",
    name: "Vasıta",
    subtitle: "Araba, motosiklet",
    demoCount: 3,
    icon: Car,
  },
  {
    id: 3,
    slug: "elektronik",
    name: "Elektronik",
    subtitle: "Telefon, bilgisayar",
    demoCount: 2,
    icon: Smartphone,
  },
  {
    id: 4,
    slug: "ev-esyasi",
    name: "Ev Eşyası",
    subtitle: "Mobilya, beyaz eşya",
    demoCount: 2,
    icon: Armchair,
  },
  {
    id: 5,
    slug: "diger",
    name: "Diğer",
    subtitle: "Hobi, iş, diğer",
    demoCount: 1,
    icon: Package,
  },
];

export const getCategoryById = (id: number) =>
  LISTING_CATEGORIES.find(category => category.id === id);

export const getCategoryBySlug = (slug: string) =>
  LISTING_CATEGORIES.find(category => category.slug === slug);

export const getCategoryName = (id: number) =>
  getCategoryById(id)?.name ?? "İlan";

export const getCategoryIdFromParam = (value: string | null) => {
  if (!value || value === "all") return "all" as const;

  const numericId = Number(value);
  if (Number.isFinite(numericId)) {
    return getCategoryById(numericId)?.id ?? ("all" as const);
  }

  return getCategoryBySlug(value)?.id ?? ("all" as const);
};
