// AI traffic control for many simultaneous users.
// - at most AI_MAX_CONCURRENT calls to the AI provider at once (default 40); the rest wait in a queue
//   (first come, first served) for up to AI_QUEUE_WAIT_MS (default 60 s), then get a clear "busy" answer
// - background pre-processing (sent automatically during dictation pauses) is optional: it is refused when the
//   server is busy, so the radiologists' own "Przygotuj opis" clicks always go first
// - one user can have at most AI_PER_USER calls in flight (default 3) — protects everybody from one runaway browser
export class BusyError extends Error {
  constructor(message, status = 503, code = 'busy', retryAfter = 5) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

export class AiLimiter {
  constructor({ max = 40, maxWaitMs = 60_000, perUser = 3, bgShare = 0.7, maxQueue = 1000 } = {}) {
    this.max = max;
    this.maxWaitMs = maxWaitMs;
    this.perUser = perUser;
    this.bgShare = bgShare;
    this.maxQueue = maxQueue;
    this.active = 0;
    this.queue = [];
    this.byUser = new Map();
    this.stats = { started: 0, queued: 0, rejectedBusy: 0, rejectedBg: 0, rejectedUser: 0, maxQueueLen: 0, maxWaitMs: 0, totalWaitMs: 0 };
  }

  snapshot() {
    return {
      max: this.max, active: this.active, queued: this.queue.length, perUser: this.perUser, ...this.stats,
      avgWaitMs: this.stats.started ? Math.round(this.stats.totalWaitMs / this.stats.started) : 0,
    };
  }

  /** Run fn() when a slot is free. Throws BusyError when the call cannot be accepted. */
  async run(userId, fn, { background = false } = {}) {
    const mine = this.byUser.get(userId) || 0;
    if (mine >= this.perUser) {
      this.stats.rejectedUser++;
      throw new BusyError('Poprzednie zapytanie jeszcze trwa — poczekaj chwilę.', 429, 'user_busy', 2);
    }
    if (background && (this.queue.length > 0 || this.active >= Math.floor(this.max * this.bgShare))) {
      this.stats.rejectedBg++;
      throw new BusyError('Serwer jest zajęty — przetwarzanie w tle wstrzymane (użyj „Przygotuj opis”).', 429, 'bg_busy', 10);
    }
    this.byUser.set(userId, mine + 1);
    const queuedAt = Date.now();
    try {
      if (this.active >= this.max) {
        if (this.queue.length >= this.maxQueue) {
          this.stats.rejectedBusy++;
          throw new BusyError('Serwer AI jest teraz bardzo obciążony — spróbuj ponownie za chwilę.', 503, 'busy', 10);
        }
        this.stats.queued++;
        await new Promise((resolve, reject) => {
          const item = { resolve, reject, timer: null };
          item.timer = setTimeout(() => {
            const i = this.queue.indexOf(item);
            if (i >= 0) this.queue.splice(i, 1);
            this.stats.rejectedBusy++;
            reject(new BusyError('Serwer AI jest teraz bardzo obciążony — spróbuj ponownie za chwilę.', 503, 'busy', 10));
          }, this.maxWaitMs);
          this.queue.push(item);
          this.stats.maxQueueLen = Math.max(this.stats.maxQueueLen, this.queue.length);
        });
      } else {
        this.active++;
      }
      const waited = Date.now() - queuedAt;
      this.stats.started++;
      this.stats.totalWaitMs += waited;
      this.stats.maxWaitMs = Math.max(this.stats.maxWaitMs, waited);
      try {
        return await fn();
      } finally {
        this.release();
      }
    } finally {
      const n = (this.byUser.get(userId) || 1) - 1;
      if (n > 0) this.byUser.set(userId, n); else this.byUser.delete(userId);
    }
  }

  /** A slot is handed directly to the next waiting call (active stays the same), otherwise freed. */
  release() {
    const next = this.queue.shift();
    if (next) {
      clearTimeout(next.timer);
      next.resolve();
    } else {
      this.active--;
    }
  }

  /** Resolves when no AI call is running or waiting (graceful shutdown), or after timeoutMs. */
  idle(timeoutMs = 30_000) {
    const until = Date.now() + timeoutMs;
    return new Promise((resolve) => {
      const check = () => (this.active === 0 && !this.queue.length) || Date.now() > until ? resolve(this.active === 0) : setTimeout(check, 200);
      check();
    });
  }
}

export const aiLimiter = new AiLimiter({
  max: Number(process.env.AI_MAX_CONCURRENT) || 40,
  maxWaitMs: Number(process.env.AI_QUEUE_WAIT_MS) || 60_000,
  perUser: Number(process.env.AI_PER_USER) || 3,
});
