// Retry wrapper — on failure, wait and try again
// On 4xx errors (like 404), fail fast — no point retrying

export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchFn();
    } catch (error: unknown) {
      lastError = error as Error;
      const message = lastError.message || '';

      // Don't retry on 4xx errors (bad request, not found, unauthorized)
      if (message.includes('4')) {
        throw lastError;
      }

      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        const waitMs = Math.pow(2, attempt - 1) * 1000;
        console.warn(`[Retry] Attempt ${attempt} failed. Waiting ${waitMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw lastError!;
}