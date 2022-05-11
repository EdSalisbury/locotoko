import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";
import { isFloat32Array } from "util/types";

export class CreateOwnerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  rate: number;
}
