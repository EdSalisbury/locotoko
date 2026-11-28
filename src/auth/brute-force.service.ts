import { Injectable } from "@nestjs/common";
import { FailedAttempts } from "./failed-attempts";

// The lockout shared by login, change-password and API keys (see
// FailedAttempts for how it counts).
@Injectable()
export class BruteForceService extends FailedAttempts {}
