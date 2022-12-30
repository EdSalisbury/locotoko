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
  @IsString()
  @IsOptional()
  @Length(1, 90)
  name: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  description: string;

  @IsNumber()
  @IsOptional()
  percentage: number;

  @IsString()
  @IsOptional()
  promotionStatus: string;

  @IsArray()
  @IsOptional()
  itemIds: Array<string>;
}
