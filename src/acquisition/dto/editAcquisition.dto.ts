import { IsNotEmpty, IsDecimal, IsString, IsDateString } from "class-validator";

export class EditAcquisitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDecimal()
  @IsNotEmpty()
  price: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
