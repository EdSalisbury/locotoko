import {
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsString,
} from "class-validator";

export class EditItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  ebayCategoryId: number;

  @IsNumber()
  ebayConditionId: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsDecimal()
  @IsOptional()
  price: number;

  @IsDecimal()
  @IsOptional()
  soldPrice: number;

  @IsDateString()
  @IsOptional()
  soldAt: string;

  @IsDateString()
  @IsOptional()
  shippedAt: string;

  @IsString()
  @IsOptional()
  listingUserId: string;

  @IsString()
  @IsOptional()
  ownerId: string;

  @IsString()
  @IsOptional()
  shippingUserId: string;

  @IsNumber()
  @IsOptional()
  weightPounds: number;

  @IsNumber()
  @IsOptional()
  weightOunces: number;

  @IsNumber()
  @IsOptional()
  shipWeightPounds: number;

  @IsNumber()
  @IsOptional()
  shipWeightOunces: number;

  @IsNumber()
  @IsOptional()
  sizeHeightInches: number;

  @IsNumber()
  @IsOptional()
  sizeWidthInches: number;

  @IsNumber()
  @IsOptional()
  sizeDepthInches: number;

  @IsNumber()
  @IsOptional()
  shipSizeHeightInches: number;

  @IsNumber()
  @IsOptional()
  shipSizeWidthInches: number;

  @IsNumber()
  @IsOptional()
  shipSizeDepthInches: number;

  @IsArray()
  images: [string];

  @IsOptional()
  specifics: string;

  @IsOptional()
  templateId: string;

  @IsOptional()
  @IsString()
  location: string;
}
