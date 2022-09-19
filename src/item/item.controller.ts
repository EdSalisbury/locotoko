import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Post,
  UseGuards,
} from "@nestjs/common";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";
import { ItemService } from "./item.service";
import { CreateItemDto, EditItemDto } from "./dto";

@UseGuards(JwtGuard)
@Controller("Items")
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Get()
  getItems(
    @Query("sold") sold: string = "",
    @Query("draft") draft: string = "",
  ) {
    if (draft == "true") {
      return this.itemService.getDraftItems();
    } else if (sold == "true") {
      return this.itemService.getSoldItems();
    } else if (sold == "false") {
      return this.itemService.getActiveItems();
    }
    return this.itemService.getItems();
  }

  @Get(":id")
  getItemById(@Param("id") itemId: string) {
    return this.itemService.getItemById(itemId);
  }

  @Post(":id/printItemLabel")
  printItemLabel(@Param("id") itemId: string) {
    return this.itemService.printItemLabel(itemId);
  }

  @Post()
  createItem(@Body() dto: CreateItemDto) {
    return this.itemService.createItem(dto);
  }

  @Patch(":id")
  editItemById(@Param("id") itemId: string, @Body() dto: EditItemDto) {
    return this.itemService.editItemById(itemId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  deleteItemById(@Param("id") itemId: string) {
    return this.itemService.deleteItemById(itemId);
  }
}
