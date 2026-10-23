import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateOperacionDto {
  @IsOptional()
  @IsString({
    message: 'El código debe ser texto',
  })
  @IsNotEmpty({
    message: 'El código no puede estar vacío',
  })
  @MaxLength(50, {
    message: 'El código no puede superar los 50 caracteres',
  })
  codigo?: string;

  @IsOptional()
  @IsInt({
    message: 'El ID del cliente debe ser un número entero',
  })
  @IsPositive({
    message: 'El ID del cliente debe ser mayor que 0',
  })
  clienteId?: number;

  @IsOptional()
  @IsString({
    message: 'El tipo de servicio debe ser texto',
  })
  @IsNotEmpty({
    message: 'El tipo de servicio no puede estar vacío',
  })
  @MaxLength(100, {
    message: 'El tipo de servicio no puede superar los 100 caracteres',
  })
  tipoServicio?: string;

  @IsOptional()
  @IsInt({
    message: 'El ID del responsable debe ser un número entero',
  })
  @IsPositive({
    message: 'El ID del responsable debe ser mayor que 0',
  })
  responsableId?: number;

  @IsOptional()
  @IsString({
    message: 'El estado debe ser texto',
  })
  @IsNotEmpty({
    message: 'El estado no puede estar vacío',
  })
  @MaxLength(50, {
    message: 'El estado no puede superar los 50 caracteres',
  })
  estado?: string;

  @IsOptional()
  @IsString({
    message: 'La observación debe ser texto',
  })
  @MaxLength(500, {
    message: 'La observación no puede superar los 500 caracteres',
  })
  observacion?: string;
}