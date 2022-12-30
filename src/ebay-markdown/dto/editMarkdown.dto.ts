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
  @IsNotEmpty()
  @Length(1, 90)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  description: string;
}
