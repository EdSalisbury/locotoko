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
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  description: string;

  @IsString()
  @IsNotEmpty()
  percentage: string;

  @IsArray()
  itemIds: Array<string>;
}
