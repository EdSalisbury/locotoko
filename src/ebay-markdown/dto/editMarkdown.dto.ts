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

export class EditMarkdownDto {
  @IsNumber()
  @IsOptional()
  percentage: number;

  @IsArray()
  @IsOptional()
  itemIds: Array<string>;
}
