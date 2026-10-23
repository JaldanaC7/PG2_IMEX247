import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductoDto {
  @IsOptional()
  @IsString({
    message: 'El nombre del producto debe ser texto',
  })
  @MaxLength(255, {
    message: 'El nombre del producto no puede superar los 255 caracteres',
  })
  producto?: string;

  @IsOptional()
  @IsString({
    message: 'La fracción arancelaria debe ser texto',
  })
  @MaxLength(20, {
    message: 'La fracción arancelaria no puede superar los 20 caracteres',
  })
  fraccionArancelaria?: string;

  @IsOptional()
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
  dai?: number;
}