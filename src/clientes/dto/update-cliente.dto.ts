import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateClienteDto {
  @IsOptional()
  @IsString({
    message: 'El NIT debe ser texto',
  })
  @MaxLength(20, {
    message: 'El NIT no puede superar los 20 caracteres',
  })
  nit?: string;

  @IsOptional()
  @IsString({
    message: 'El nombre debe ser texto',
  })
  @MaxLength(150, {
    message: 'El nombre no puede superar los 150 caracteres',
  })
  nombre?: string;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'El correo debe tener un formato válido',
    },
  )
  @MaxLength(150, {
    message: 'El correo no puede superar los 150 caracteres',
  })
  correo?: string;

  @IsOptional()
  @IsString({
    message: 'El teléfono debe ser texto',
  })
  @MaxLength(30, {
    message: 'El teléfono no puede superar los 30 caracteres',
  })
  telefono?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El estado activo debe ser verdadero o falso',
  })
  activo?: boolean;
}