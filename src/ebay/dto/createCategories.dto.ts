import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";

export class CreateCategoriesDto {
  CategoryArray: CategoryArrayDto;
}

export class CategoryArrayDto {
  Category: CategoryDto[];
}

export class CategoryDto {
  categoryID: number;
  categoryName: string;
  categoryParentID: number;
}
