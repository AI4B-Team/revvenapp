// Bound non-cancelable operations such as an authentication check.
export async function withTimeout<T>(operation: PromiseLike<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(operation),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Request timed out. Please try again.')), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}