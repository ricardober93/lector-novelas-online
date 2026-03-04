export const fetcher = async <T = unknown>(
  url: string, 
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(url, options);
  
  if (!res.ok) {
    let errorMessage = `Error ${res.status}`;
    
    try {
      const data = await res.json();
      if (data.error) {
        errorMessage = data.error;
      }
    } catch {
      const text = await res.text().catch(() => '');
      if (text) {
        errorMessage = `Error del servidor (${res.status})`;
      }
    }
    
    const error = new Error(errorMessage);
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
};
