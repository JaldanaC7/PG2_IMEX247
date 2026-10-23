import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CambiarContraseniaDto {
  @IsString({
    message: 'La contraseña debe ser texto',
  })
  @IsNotEmpty({
    message: 'La contraseña es obligatoria',
  })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @MaxLength(100, {
    message: 'La contraseña no puede superar los 100 caracteres',
  })
  contrasenia: string;
}