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

export class EditMarkdownDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
