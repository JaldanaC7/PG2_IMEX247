import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Operacion } from '../operaciones/entities/operacion.entity';
import { Bitacora } from '../bitacora/entities/bitacora.entity';

export type AlertaOperacion = {
  operacionId: number;
  codigo: string;
  tipoServicio: string;
  estado: string;
  cliente: {
    id: number;
    nombre: string;
    nit: string;
  };
  responsable: {
    id: number;
    usuario: string;
  };
  fechaRegistro: Date;
  ultimaActividad: Date;
  diasSinActualizacion: number;
  tipoAlerta: 'SIN_ACTUALIZACION';
};

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(Operacion)
    private readonly operacionRepository: Repository<Operacion>,

    @InjectRepository(Bitacora)
    private readonly bitacoraRepository: Repository<Bitacora>,
  ) {}

  async obtenerAlertas(
    dias: number,
  ): Promise<AlertaOperacion[]> {
    const operaciones =
      await this.operacionRepository.find({
        relations: {
          cliente: true,
          responsable: true,
        },
        order: {
          fechaRegistro: 'ASC',
        },
      });

    const ahora = new Date();

    const alertas: AlertaOperacion[] = [];

    for (const operacion of operaciones) {
      // Las operaciones finalizadas ya no requieren
      // seguimiento operativo por falta de actualización.
      if (operacion.estado === 'FINALIZADO') {
        continue;
      }

      const ultimoRegistro =
        await this.bitacoraRepository.findOne({
          where: {
            operacion: {
              id: operacion.id,
            },
          },
          order: {
            fechaRegistro: 'DESC',
          },
        });

      const ultimaActividad =
        ultimoRegistro?.fechaRegistro ??
        operacion.fechaRegistro;

      const diferenciaMilisegundos =
        ahora.getTime() -
        new Date(ultimaActividad).getTime();

      const diasSinActualizacion = Math.floor(
        diferenciaMilisegundos /
          (1000 * 60 * 60 * 24),
      );

      if (diasSinActualizacion >= dias) {
        alertas.push({
          operacionId: operacion.id,
          codigo: operacion.codigo,
          tipoServicio: operacion.tipoServicio,
          estado: operacion.estado,

          cliente: {
            id: operacion.cliente.id,
            nombre: operacion.cliente.nombre,
            nit: operacion.cliente.nit,
          },

          responsable: {
            id: operacion.responsable.id,
            usuario: operacion.responsable.usuario,
          },

          fechaRegistro: operacion.fechaRegistro,
          ultimaActividad,
          diasSinActualizacion,
          tipoAlerta: 'SIN_ACTUALIZACION',
        });
      }
    }

    return alertas.sort(
      (a, b) =>
        b.diasSinActualizacion -
        a.diasSinActualizacion,
    );
  }
}