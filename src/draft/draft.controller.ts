import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import type { Request } from "express";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";
import { DraftInputError, DraftNotFoundError, DraftService } from "./draft.service";
import { draftAnswer, siteAddress } from "./draft-answer";
import { MAX_PHOTOS } from "./photos";
import type { UploadedPhoto } from "./photos";

// One more than allowed, so too many photos get a plain answer instead of
// the upload library's error.
const uploadOptions = {
  limits: { files: MAX_PHOTOS + 1, fileSize: 40 * 1024 * 1024 },
};

async function answer(request: Request, work: () => Promise<Parameters<typeof draftAnswer>[0]>) {
  try {
    return draftAnswer(await work(), siteAddress(request));
  } catch (e) {
    if (e instanceof DraftInputError) {
      throw new BadRequestException(e.message);
    }
    if (e instanceof DraftNotFoundError) {
      throw new NotFoundException(e.message);
    }
    throw e;
  }
}

// For Lucida (with an API key): drafts made from an item's photos.
@UseGuards(JwtGuard)
@Controller("drafts")
export class DraftController {
  constructor(private drafts: DraftService) {}

  // Answers at once; identifying runs in the background.
  @Post()
  @UseInterceptors(FilesInterceptor("photos", MAX_PHOTOS + 1, uploadOptions))
  createDraft(
    @GetUser("id") userId: string,
    @UploadedFiles() files: UploadedPhoto[],
    @Body("lucidaItemNumber") lucidaItemNumber: unknown,
    @Req() request: Request,
  ) {
    return answer(request, () => this.drafts.createDraft(userId, files, lucidaItemNumber));
  }

  @Get()
  findDraft(@Query("lucidaItemNumber") lucidaItemNumber: unknown, @Req() request: Request) {
    return answer(request, () => this.drafts.findByLucidaItemNumber(lucidaItemNumber));
  }

  @Get(":id")
  getDraft(@Param("id") id: string, @Req() request: Request) {
    return answer(request, () => this.drafts.getDraft(id));
  }

  @Put(":id/photos")
  @UseInterceptors(FilesInterceptor("photos", MAX_PHOTOS + 1, uploadOptions))
  replacePhotos(@Param("id") id: string, @UploadedFiles() files: UploadedPhoto[], @Req() request: Request) {
    return answer(request, () => this.drafts.replacePhotos(id, files));
  }
}
