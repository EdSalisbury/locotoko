import {
  IsNotEmpty,
  IsCurrency,
  IsString,
  IsDateString,
} from "class-validator";

export class CreatePayoutDto {
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
