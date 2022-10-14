import { IsNotEmpty, IsCurrency, IsString, IsDateString } from "class-validator";

export class EditPayoutDto {
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsCurrency()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
