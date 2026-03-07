interface Page {
  id: string;
  number: number;
  imageUrl: string;
  width: number | null;
  height: number | null;
}

export function getDemoImages(count: number = 20): Page[] {
  if (process.env.NODE_ENV === 'production') {
    return [];
  }

  return Array.from({ length: count }, (_, i) => ({
    id: `demo-${i + 1}`,
    number: i + 1,
    imageUrl: `https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=Page+${i + 1}`,
    width: 800,
    height: 1200,
  }));
}
