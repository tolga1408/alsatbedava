import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_DETAIL_OPTIONS,
  getCategoryDetailLabel,
} from "@/lib/categoryOptions";

type CategoryFilterValues = {
  propertyType: string;
  minRooms: string;
  maxRooms: string;
  minSize: string;
  maxSize: string;
};

type BrowseCategoryFiltersProps = CategoryFilterValues & {
  categoryId: number | "all";
  idSuffix?: string;
  onChange: (values: Partial<CategoryFilterValues>) => void;
};

export function BrowseCategoryFilters({
  categoryId,
  idSuffix = "desktop",
  propertyType,
  minRooms,
  maxRooms,
  minSize,
  maxSize,
  onChange,
}: BrowseCategoryFiltersProps) {
  if (categoryId === "all") return null;

  const detailOptions = CATEGORY_DETAIL_OPTIONS[categoryId] ?? [];
  const isProperty = categoryId === 1;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`property-type-${idSuffix}`}>
          {getCategoryDetailLabel(categoryId)}
        </Label>
        <Select
          value={propertyType || "all"}
          onValueChange={value =>
            onChange({ propertyType: value === "all" ? "" : value })
          }
        >
          <SelectTrigger id={`property-type-${idSuffix}`}>
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {detailOptions.map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isProperty && (
        <>
          <div className="space-y-2">
            <Label>Oda Sayısı</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="0"
                placeholder="En az"
                value={minRooms}
                onChange={event => onChange({ minRooms: event.target.value })}
              />
              <Input
                type="number"
                min="0"
                placeholder="En çok"
                value={maxRooms}
                onChange={event => onChange({ maxRooms: event.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Metrekare (m²)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="0"
                placeholder="En az"
                value={minSize}
                onChange={event => onChange({ minSize: event.target.value })}
              />
              <Input
                type="number"
                min="0"
                placeholder="En çok"
                value={maxSize}
                onChange={event => onChange({ maxSize: event.target.value })}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
