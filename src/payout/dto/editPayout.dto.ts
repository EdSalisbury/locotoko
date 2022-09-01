import { IsNotEmpty, IsDecimal, IsString, IsDateString } from "class-validator";

export class EditPayoutDto {
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
