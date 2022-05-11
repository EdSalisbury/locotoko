import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";

export class EditOwnerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  rate: number;
}
