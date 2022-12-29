import {
  IsArray,
  IsDateString,
  IsCurrency,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";

export class CreateMarkdownDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
