import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductoDto {
  @IsString({
    message: 'El nombre del producto debe ser texto',
  })
  @IsNotEmpty({
    message: 'El nombre del producto es obligatorio',
  })
  @MaxLength(255, {
    message: 'El nombre del producto no puede superar los 255 caracteres',
  })
  producto: string;

  @IsString({
    message: 'La fracción arancelaria debe ser texto',
  })
  @IsNotEmpty({
    message: 'La fracción arancelaria es obligatoria',
  })
  @MaxLength(20, {
    message: 'La fracción arancelaria no puede superar los 20 caracteres',
  })
  fraccionArancelaria: string;

  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'El DAI debe ser un número válido',
    },
  )
  @Min(0, {
    message: 'El DAI no puede ser menor que 0',
  })
  @Max(100, {
    message: 'El DAI no puede ser mayor que 100',
  })
  dai: number;
}