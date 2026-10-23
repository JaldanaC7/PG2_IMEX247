import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDocumentoDto {
  @IsString({
    message: 'El tipo de documento debe ser texto',
  })
  @IsNotEmpty({
    message: 'El tipo de documento es obligatorio',
  })
  @MaxLength(100, {
    message: 'El tipo de documento no puede superar los 100 caracteres',
  })
  tipoDocumento: string;
}