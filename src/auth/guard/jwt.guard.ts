import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiKeyService } from "../api-key.service";
import { checkApiKey } from "../api-key";
import { BruteForceService } from "../brute-force.service";
import { getClientIp } from "../client-ip";

// A logged-in request (a JWT), or one from another program carrying an API
// key, which then acts as the key's user (see checkApiKey).
@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  constructor(
    private apiKeys: ApiKeyService,
    private bruteForce: BruteForceService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const check = await checkApiKey(
      request,
      getClientIp(request),
      (key) => this.apiKeys.authenticate(key),
      this.bruteForce,
    );
    switch (check.result) {
      case "no-key":
        return (await super.canActivate(context)) as boolean;
      case "locked":
        throw new HttpException("Too many wrong attempts. Locked out.", HttpStatus.TOO_MANY_REQUESTS);
      case "invalid":
        throw new UnauthorizedException("Invalid API key");
      case "user":
        request.user = check.user;
        return true;
    }
  }
}
