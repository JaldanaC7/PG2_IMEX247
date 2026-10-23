import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateClienteDto {
  @IsString({
    message: 'El NIT debe ser texto',
  })
  @IsNotEmpty({
    message: 'El NIT es obligatorio',
  })
  @MaxLength(20, {
    message: 'El NIT no puede superar los 20 caracteres',
  })
  nit: string;

  @IsString({
    message: 'El nombre debe ser texto',
  })
  @IsNotEmpty({
    message: 'El nombre es obligatorio',
  })
  @MaxLength(150, {
    message: 'El nombre no puede superar los 150 caracteres',
  })
  nombre: string;

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
}