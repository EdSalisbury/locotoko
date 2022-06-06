import {
  IsString,
} from "class-validator";

export class UpdateEbayListingDto {
  @IsString()
  itemId: string;
}
