type CategoryAlias = {
  categoryId: number;
  tokens: string[];
};

const normalizeToken = (value: string) =>
  value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const categoryAliases: CategoryAlias[] = [
  { categoryId: 4, tokens: ["ev", "esyasi"] },
  { categoryId: 4, tokens: ["beyaz", "esya"] },
  { categoryId: 2, tokens: ["ticari", "arac"] },
  ...["ev", "daire", "villa", "emlak", "konut", "arsa", "house", "home"].map(
    token => ({ categoryId: 1, tokens: [token] })
  ),
  ...["araba", "arac", "otomobil", "vasita", "motosiklet", "motor", "car"].map(
    token => ({ categoryId: 2, tokens: [token] })
  ),
  ...["telefon", "iphone", "bilgisayar", "laptop", "tablet", "elektronik"].map(
    token => ({ categoryId: 3, tokens: [token] })
  ),
  ...["mobilya", "koltuk", "buzdolabi", "dekorasyon"].map(token => ({
    categoryId: 4,
    tokens: [token],
  })),
  ...["gitar", "hobi", "kamera", "fotograf"].map(token => ({
    categoryId: 5,
    tokens: [token],
  })),
].sort((left, right) => right.tokens.length - left.tokens.length);

export type ListingSearchIntent = {
  categoryId?: number;
  textSearch?: string;
};

export function parseListingSearch(search?: string): ListingSearchIntent {
  const trimmed = search?.trim();
  if (!trimmed) return {};

  const rawTokens = trimmed.split(/\s+/);
  const normalizedTokens = rawTokens.map(normalizeToken);

  for (const alias of categoryAliases) {
    for (
      let start = 0;
      start <= normalizedTokens.length - alias.tokens.length;
      start += 1
    ) {
      const matches = alias.tokens.every(
        (token, offset) => normalizedTokens[start + offset] === token
      );
      if (!matches) continue;

      const remaining = rawTokens
        .filter(
          (_token, index) =>
            index < start || index >= start + alias.tokens.length
        )
        .join(" ")
        .trim();

      return {
        categoryId: alias.categoryId,
        textSearch: remaining || undefined,
      };
    }
  }

  return { textSearch: trimmed };
}

export const inferListingCategoryId = (search?: string) =>
  parseListingSearch(search).categoryId;
