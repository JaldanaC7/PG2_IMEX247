import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOperacionDto {
  @IsString({
    message: 'El código debe ser texto',
  })
  @IsNotEmpty({
    message: 'El código de la operación es obligatorio',
  })
  @MaxLength(50, {
    message: 'El código no puede superar los 50 caracteres',
  })
  codigo: string;

  @IsInt({
    message: 'El ID del cliente debe ser un número entero',
  })
  @IsPositive({
    message: 'El ID del cliente debe ser mayor que 0',
  })
  clienteId: number;

  @IsString({
    message: 'El tipo de servicio debe ser texto',
  })
  @IsNotEmpty({
    message: 'El tipo de servicio es obligatorio',
  })
  @MaxLength(100, {
    message: 'El tipo de servicio no puede superar los 100 caracteres',
  })
  tipoServicio: string;

  @IsInt({
    message: 'El ID del responsable debe ser un número entero',
  })
  @IsPositive({
    message: 'El ID del responsable debe ser mayor que 0',
  })
  responsableId: number;
}