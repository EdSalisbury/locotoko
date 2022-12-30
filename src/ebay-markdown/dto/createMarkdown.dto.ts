import {
  IsArray,
  IsDateString,
  IsCurrency,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Length,
} from "class-validator";

export class CreateMarkdownDto {
  @IsString()
  @IsNotEmpty()
  percentage: string;

  @IsArray()
  itemIds: Array<string>;
}
