import { IsNotEmpty, IsDecimal, IsString, IsDateString } from "class-validator";

export class CreateAcquisitionDto {
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
