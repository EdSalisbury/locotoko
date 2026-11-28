// Counts wrong passwords and wrong API keys per address. Kept free of NestJS
// (BruteForceService wraps it) so it can be unit tested.

const MAX_FAILED_ATTEMPTS = 3;

// Deliberate delay on every wrong password or API key, win or lose on the
// lockout check - slows brute force even before the lockout threshold hits.
const FAILED_ATTEMPT_DELAY_MS = 1000;

export class FailedAttempts {
  // In-memory, per-process: resets on an app restart, not on a timer. A
  // locked-out address needs a restart to clear - acceptable tradeoff given
  // direct access to the box if self-locked-out. A successful login resets
  // the counter, so occasional typos don't stack toward a lockout.
  private failedAttempts = new Map<string, number>();

  failedAttemptDelayMs = FAILED_ATTEMPT_DELAY_MS;

  isLocked(address: string): boolean {
    return (this.failedAttempts.get(address) ?? 0) >= MAX_FAILED_ATTEMPTS;
  }

  recordFailure(address: string): void {
    this.failedAttempts.set(address, (this.failedAttempts.get(address) ?? 0) + 1);
  }

  recordSuccess(address: string): void {
    this.failedAttempts.delete(address);
  }

  delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.failedAttemptDelayMs));
  }
}
