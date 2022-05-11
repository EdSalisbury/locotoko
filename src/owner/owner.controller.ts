import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";
import { OwnerService } from "./owner.service";
import {
  CreateOwnerDto,
  EditOwnerDto,
} from "./dto";

@UseGuards(JwtGuard)
@Controller("Owners")
export class OwnerController {
  constructor(
    private ownerService: OwnerService,
  ) {}

  @Get()
  getOwners() {
    return this.ownerService.getOwners();
  }

  @Get(":id")
  getOwner(
    @Param("id") ownerId: string,
  ) {
    return this.ownerService.getOwner(
      ownerId,
    );
  }

  @Post()
  createOwner(
    @Body() dto: CreateOwnerDto,
  ) {
    return this.ownerService.createOwner(
      dto,
    );
  }

  @Patch(":id")
  editOwner(
    @Param("id") ownerId: string,
    @Body() dto: EditOwnerDto,
  ) {
    return this.ownerService.editOwner(
      ownerId,
      dto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  deleteOwner(
    @Param("id") ownerId: string,
  ) {
    return this.ownerService.deleteOwner(
      ownerId,
    );
  }
}
