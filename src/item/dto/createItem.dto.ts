import {
  IsArray,
  IsDateString,
  IsCurrency,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

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

  @IsNumber()
  @IsOptional()
  quantitySold: number;

  @IsOptional()
  price: number;

  @IsCurrency()
  @IsOptional()
  shippingPrice: number;

  @IsNumber()
  @IsOptional()
  shippingType: number;

  @IsCurrency()
  @IsOptional()
  soldPrice: number;

  @IsDateString()
  @IsOptional()
  soldAt: string;

  @IsDateString()
  @IsOptional()
  shippedAt: string;

  @IsString()
  @IsNotEmpty()
  listingUserId: string;

  @IsString()
  @IsOptional()
  shippingUserId: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

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
  acquisitionId: string;

  @IsOptional()
  upc: string;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsBoolean()
  ready: boolean;
}
