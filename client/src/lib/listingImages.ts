export const getListingImages = (images: unknown): string[] => {
  if (Array.isArray(images)) {
    return images.filter((image): image is string => typeof image === "string");
  }

  if (typeof images !== "string" || !images.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed)
      ? parsed.filter((image): image is string => typeof image === "string")
      : [];
  } catch {
    return images.startsWith("http") || images.startsWith("data:image")
      ? [images]
      : [];
  }
};
