import { Injectable } from "@nestjs/common";

const MAX_FAILED_ATTEMPTS = 3;

@Injectable()
export class BruteForceService {
  // In-memory, per-process: resets on an app restart, not on a timer. A
  // locked-out address needs a restart to clear - acceptable tradeoff given
  // direct access to the box if self-locked-out. A successful login resets
  // the counter, so occasional typos don't stack toward a lockout.
  private failedAttempts = new Map<string, number>();

  isLocked(address: string): boolean {
    return (this.failedAttempts.get(address) ?? 0) >= MAX_FAILED_ATTEMPTS;
  }

  recordFailure(address: string): void {
    this.failedAttempts.set(address, (this.failedAttempts.get(address) ?? 0) + 1);
  }

  recordSuccess(address: string): void {
    this.failedAttempts.delete(address);
  }
}
