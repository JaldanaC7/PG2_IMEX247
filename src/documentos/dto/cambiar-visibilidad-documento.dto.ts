import { IsBoolean } from 'class-validator';

export class CambiarVisibilidadDocumentoDto {
  @IsBoolean({
    message: 'La visibilidad debe ser un valor booleano',
  })
  visibleCliente: boolean;
}