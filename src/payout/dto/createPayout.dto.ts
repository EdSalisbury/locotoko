import { IsNotEmpty, IsDecimal, IsString, IsDateString } from "class-validator";

export class CreatePayoutDto {
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsDecimal()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
