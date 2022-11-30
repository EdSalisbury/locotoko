import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";

export class CreateOwnerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  rate: number;
}
