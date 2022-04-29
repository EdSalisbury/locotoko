import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
