// Normalizes various API shapes for the reading history into a flat array
export type ReadingHistory = {
  id: string;
  chapter: {
    id: string;
    number: number;
    title?: string | null;
    volume: {
      number: number;
      series: {
        id: string;
        title: string;
      };
    };
  };
  lastPage: number;
  progress: number;
  updatedAt: string;
};

export function normalizeReadingHistory(input: unknown): ReadingHistory[] {
  if (Array.isArray(input)) {
    return input as ReadingHistory[];
  }
  if (input && typeof input === "object") {
    const a: any = input as any;
    if (Array.isArray(a.history)) return a.history as ReadingHistory[];
    if (Array.isArray(a.data)) return a.data as ReadingHistory[];
    if (Array.isArray(a.readingHistory)) return a.readingHistory as ReadingHistory[];
  }
  return [];
}

export default normalizeReadingHistory;
