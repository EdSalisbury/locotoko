import {
  createParamDecorator,
  ExecutionContext,
} from "@nestjs/common";
import { Request } from "express";
import { getClientIp } from "../client-ip";

export const ClientIp = createParamDecorator(
  (
    _data: undefined,
    ctx: ExecutionContext,
  ) => {
    const request: Request = ctx
      .switchToHttp()
      .getRequest();

    return getClientIp(request);
  },
);
