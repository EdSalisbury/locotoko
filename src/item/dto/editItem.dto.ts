import {
  IsDateString,
  IsCurrency,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";

export class EditItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  ebayCategoryId: number;

  @IsNumber()
  @IsOptional()
  ebayConditionId: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  quantity: number;

  @IsNumber()
  @IsOptional()
  quantitySold: number;

  @IsCurrency()
  @IsOptional()
  price: number;

  @IsCurrency()
  @IsOptional()
  currentPrice: number;

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
  @IsOptional()
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

  @IsDateString()
  @IsOptional()
  listedAt: string;
}
