import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RolUsuario } from '../entities/user.entity';

export class CreateUserDto {
  @IsString({
    message: 'El usuario debe ser texto',
  })
  @IsNotEmpty({
    message: 'El usuario es obligatorio',
  })
  @MaxLength(50, {
    message: 'El usuario no puede superar los 50 caracteres',
  })
  usuario: string;

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

  @IsOptional()
  @IsEnum(RolUsuario, {
    message: 'El rol debe ser ADMIN, OPERADOR o CLIENTE',
  })
  rol?: RolUsuario;

  @IsOptional()
  @IsInt({
    message: 'El ID del cliente debe ser un número entero',
  })
  @IsPositive({
    message: 'El ID del cliente debe ser mayor que 0',
  })
  clienteId?: number;
}