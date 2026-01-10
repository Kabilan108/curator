type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEvent {
  event: string;
  [key: string]: unknown;
}

const logFunctions = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
} as const;

function log(level: LogLevel, data: LogEvent): void {
  const formatted = JSON.stringify({
    ...data,
    timestamp: new Date().toISOString(),
    level,
  });
  logFunctions[level](formatted);
}

export const logger = {
  debug: (data: LogEvent) => log("debug", data),
  info: (data: LogEvent) => log("info", data),
  warn: (data: LogEvent) => log("warn", data),
  error: (data: LogEvent) => log("error", data),
};

export const importLogger = {
  started: (jobId: string, itemCount: number) =>
    logger.info({ event: "import_started", jobId, itemCount }),

  batchStarted: (
    jobId: string,
    batchIndex: number,
    totalBatches: number,
    itemCount: number,
  ) =>
    logger.info({
      event: "import_batch_started",
      jobId,
      batchIndex,
      totalBatches,
      itemCount,
    }),

  batchCompleted: (
    jobId: string,
    batchIndex: number,
    successCount: number,
    failCount: number,
    durationMs: number,
  ) =>
    logger.info({
      event: "import_batch_completed",
      jobId,
      batchIndex,
      successCount,
      failCount,
      durationMs,
    }),

  completed: (jobId: string, successCount: number, failCount: number) =>
    logger.info({ event: "import_completed", jobId, successCount, failCount }),

  failed: (jobId: string, error: string) =>
    logger.error({ event: "import_failed", jobId, error }),
};

export const anilistLogger = {
  fetchStarted: (malId: number, mediaType: "ANIME" | "MANGA", title: string) =>
    logger.debug({ event: "anilist_fetch_started", malId, mediaType, title }),

  fetchSuccess: (
    malId: number,
    mediaType: "ANIME" | "MANGA",
    anilistId: number,
    responseTimeMs: number,
    fallbackUsed: boolean,
  ) =>
    logger.info({
      event: "anilist_fetch_success",
      malId,
      mediaType,
      anilistId,
      responseTimeMs,
      fallbackUsed,
    }),

  fetchFailed: (
    malId: number,
    mediaType: "ANIME" | "MANGA",
    title: string,
    error: string,
    retryCount: number,
  ) =>
    logger.warn({
      event: "anilist_fetch_failed",
      malId,
      mediaType,
      title,
      error,
      retryCount,
    }),

  rateLimited: (retryAfterMs?: number) =>
    logger.warn({
      event: "anilist_rate_limited",
      error: retryAfterMs
        ? `Rate limited, retry after ${retryAfterMs}ms`
        : "Rate limited",
    }),
};
