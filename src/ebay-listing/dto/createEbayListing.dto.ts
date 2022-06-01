import {
  IsEmail,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateEbayListingDto {
  @IsString()
  itemId: string;
}
