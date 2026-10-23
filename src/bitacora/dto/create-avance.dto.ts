import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAvanceDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'La observación debe ser texto',
  })
  @IsNotEmpty({
    message: 'La observación es obligatoria',
  })
  @MaxLength(500, {
    message: 'La observación no puede superar los 500 caracteres',
  })
  observacion: string;
}