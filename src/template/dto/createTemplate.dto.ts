import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  ebayCategoryId: number;
}
