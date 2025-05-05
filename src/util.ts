  export const retryOperation = async<T = any>(
    operation: () => Promise<T>,
    retryCount: number,
  ): Promise<T> => {
    let lastError: Error | null = null;

    for (let i = 0; i < retryCount; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`操作失败，第 ${i + 1} 次重试...`);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    throw lastError || new Error('重试次数已用完');
  }