import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Request } from "express";
import { BruteForceService } from "../brute-force.service";
import { getClientIp } from "../client-ip";

@Injectable()
export class BruteForceGuard implements CanActivate {
  constructor(private bruteForce: BruteForceService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const address = getClientIp(request);

    if (this.bruteForce.isLocked(address)) {
      throw new HttpException(
        "Too many wrong attempts. Locked out.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
