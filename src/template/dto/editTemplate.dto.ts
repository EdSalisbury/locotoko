import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";

export class EditTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  ebayCategoryId: number;

  @IsString()
  specifics: string;
}
