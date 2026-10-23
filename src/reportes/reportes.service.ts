import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Operacion } from '../operaciones/entities/operacion.entity';
import { Bitacora } from '../bitacora/entities/bitacora.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Operacion)
    private readonly operacionRepository: Repository<Operacion>,

    @InjectRepository(Bitacora)
    private readonly bitacoraRepository: Repository<Bitacora>,
  ) {}

  async obtenerResumen(
    fechaInicio?: string,
    fechaFin?: string,
  ) {
    const aplicarFiltro =
      fechaInicio && fechaFin;

    // TOTAL DE OPERACIONES
    const totalQuery =
      this.operacionRepository
        .createQueryBuilder('operacion');

    if (aplicarFiltro) {
      totalQuery
        .where(
          'operacion.fechaRegistro >= :fechaInicio',
          {
            fechaInicio: `${fechaInicio} 00:00:00`,
          },
        )
        .andWhere(
          'operacion.fechaRegistro <= :fechaFin',
          {
            fechaFin: `${fechaFin} 23:59:59`,
          },
        );
    }

    const totalOperaciones =
      await totalQuery.getCount();

    // OPERACIONES PENDIENTES
    const pendientesQuery =
      this.operacionRepository
        .createQueryBuilder('operacion')
        .where(
          'operacion.estado != :estadoFinalizado',
          {
            estadoFinalizado: 'FINALIZADO',
          },
        );

    if (aplicarFiltro) {
      pendientesQuery
        .andWhere(
          'operacion.fechaRegistro >= :fechaInicio',
          {
            fechaInicio: `${fechaInicio} 00:00:00`,
          },
        )
        .andWhere(
          'operacion.fechaRegistro <= :fechaFin',
          {
            fechaFin: `${fechaFin} 23:59:59`,
          },
        );
    }

    const operacionesPendientes =
      await pendientesQuery.getCount();

    // OPERACIONES FINALIZADAS
    const finalizadasQuery =
      this.operacionRepository
        .createQueryBuilder('operacion')
        .where(
          'operacion.estado = :estadoFinalizado',
          {
            estadoFinalizado: 'FINALIZADO',
          },
        );

    if (aplicarFiltro) {
      finalizadasQuery
        .andWhere(
          'operacion.fechaRegistro >= :fechaInicio',
          {
            fechaInicio: `${fechaInicio} 00:00:00`,
          },
        )
        .andWhere(
          'operacion.fechaRegistro <= :fechaFin',
          {
            fechaFin: `${fechaFin} 23:59:59`,
          },
        );
    }

    const operacionesFinalizadas =
      await finalizadasQuery.getCount();

    // PORCENTAJE DE OPERACIONES FINALIZADAS
    const porcentajeFinalizadas =
      totalOperaciones > 0
        ? Number(
            (
              (operacionesFinalizadas /
                totalOperaciones) *
              100
            ).toFixed(2),
          )
        : 0;

    // TIEMPO PROMEDIO DE OPERACIONES FINALIZADAS
    //
    // Solo se consideran operaciones cuyo estado ACTUAL
    // sea FINALIZADO.
    //
    // Para cada operación se utiliza la primera transición
    // registrada hacia FINALIZADO.
    const tiempoFinalizacionQuery =
      this.bitacoraRepository
        .createQueryBuilder('bitacora')
        .innerJoin(
          'bitacora.operacion',
          'operacion',
        )
        .select(
          'AVG(TIMESTAMPDIFF(MINUTE, operacion.fechaRegistro, bitacora.fechaRegistro))',
          'promedioMinutos',
        )
        .addSelect(
          'COUNT(DISTINCT operacion.id)',
          'cantidadOperaciones',
        )
        .where(
          'operacion.estado = :estadoFinalizado',
          {
            estadoFinalizado: 'FINALIZADO',
          },
        )
        .andWhere(
          'bitacora.estadoNuevo = :estadoFinalizado',
        )
        .andWhere(`
          bitacora.fechaRegistro = (
            SELECT MIN(b2.fechaRegistro)
            FROM bitacora b2
            WHERE b2.operacionId = operacion.id
              AND b2.estadoNuevo = :estadoFinalizado
          )
        `);

    if (aplicarFiltro) {
      tiempoFinalizacionQuery
        .andWhere(
          'operacion.fechaRegistro >= :fechaInicio',
          {
            fechaInicio: `${fechaInicio} 00:00:00`,
          },
        )
        .andWhere(
          'operacion.fechaRegistro <= :fechaFin',
          {
            fechaFin: `${fechaFin} 23:59:59`,
          },
        );
    }

    const tiempoFinalizacionRaw =
      await tiempoFinalizacionQuery.getRawOne();

    const promedioMinutos =
      Number(
        tiempoFinalizacionRaw?.promedioMinutos ??
          0,
      );

    const tiempoPromedioFinalizacionHoras =
      Number(
        (
          promedioMinutos / 60
        ).toFixed(2),
      );

    const tiempoPromedioFinalizacionDias =
      Number(
        (
          promedioMinutos /
          60 /
          24
        ).toFixed(2),
      );

    const operacionesConTiempoCalculado =
      Number(
        tiempoFinalizacionRaw
          ?.cantidadOperaciones ?? 0,
      );

    // OPERACIONES POR ESTADO
    const estadoQuery =
      this.operacionRepository
        .createQueryBuilder('operacion')
        .select(
          'operacion.estado',
          'estado',
        )
        .addSelect(
          'COUNT(operacion.id)',
          'cantidad',
        );

    if (aplicarFiltro) {
      estadoQuery
        .where(
          'operacion.fechaRegistro >= :fechaInicio',
          {
            fechaInicio: `${fechaInicio} 00:00:00`,
          },
        )
        .andWhere(
          'operacion.fechaRegistro <= :fechaFin',
          {
            fechaFin: `${fechaFin} 23:59:59`,
          },
        );
    }

    const operacionesPorEstado =
      await estadoQuery
        .groupBy('operacion.estado')
        .orderBy(
          'operacion.estado',
          'ASC',
        )
        .getRawMany();

    // OPERACIONES POR TIPO DE SERVICIO
    const tipoServicioQuery =
      this.operacionRepository
        .createQueryBuilder('operacion')
        .select(
          'operacion.tipoServicio',
          'tipoServicio',
        )
        .addSelect(
          'COUNT(operacion.id)',
          'cantidad',
        );

    if (aplicarFiltro) {
      tipoServicioQuery
        .where(
          'operacion.fechaRegistro >= :fechaInicio',
          {
            fechaInicio: `${fechaInicio} 00:00:00`,
          },
        )
        .andWhere(
          'operacion.fechaRegistro <= :fechaFin',
          {
            fechaFin: `${fechaFin} 23:59:59`,
          },
        );
    }

    const operacionesPorTipoServicio =
      await tipoServicioQuery
        .groupBy(
          'operacion.tipoServicio',
        )
        .orderBy(
          'operacion.tipoServicio',
          'ASC',
        )
        .getRawMany();

    // OPERACIONES POR RESPONSABLE
    const responsableQuery =
      this.operacionRepository
        .createQueryBuilder('operacion')
        .innerJoin(
          'operacion.responsable',
          'responsable',
        )
        .select(
          'responsable.id',
          'responsableId',
        )
        .addSelect(
          'responsable.usuario',
          'usuario',
        )
        .addSelect(
          'COUNT(operacion.id)',
          'cantidad',
        );

    if (aplicarFiltro) {
      responsableQuery
        .where(
          'operacion.fechaRegistro >= :fechaInicio',
          {
            fechaInicio: `${fechaInicio} 00:00:00`,
          },
        )
        .andWhere(
          'operacion.fechaRegistro <= :fechaFin',
          {
            fechaFin: `${fechaFin} 23:59:59`,
          },
        );
    }

    const operacionesPorResponsable =
      await responsableQuery
        .groupBy('responsable.id')
        .addGroupBy(
          'responsable.usuario',
        )
        .orderBy(
          'responsable.usuario',
          'ASC',
        )
        .getRawMany();

    return {
      totalOperaciones,
      operacionesPendientes,
      operacionesFinalizadas,
      porcentajeFinalizadas,

      tiempoPromedioFinalizacionHoras,
      tiempoPromedioFinalizacionDias,
      operacionesConTiempoCalculado,

      operacionesPorEstado:
        operacionesPorEstado.map(
          (item) => ({
            estado: item.estado,
            cantidad:
              Number(item.cantidad),
          }),
        ),

      operacionesPorTipoServicio:
        operacionesPorTipoServicio.map(
          (item) => ({
            tipoServicio:
              item.tipoServicio,
            cantidad:
              Number(item.cantidad),
          }),
        ),

      operacionesPorResponsable:
        operacionesPorResponsable.map(
          (item) => ({
            responsableId:
              Number(
                item.responsableId,
              ),
            usuario: item.usuario,
            cantidad:
              Number(item.cantidad),
          }),
        ),
    };
  }

  async obtenerHistorico(
    fechaInicio: string,
    fechaFin: string,
  ) {
    return this.operacionRepository
      .createQueryBuilder('operacion')
      .leftJoinAndSelect(
        'operacion.cliente',
        'cliente',
      )
      .leftJoinAndSelect(
        'operacion.responsable',
        'responsable',
      )
      .where(
        'operacion.estado = :estadoFinalizado',
        {
          estadoFinalizado: 'FINALIZADO',
        },
      )
      .andWhere(
        'operacion.fechaRegistro >= :fechaInicio',
        {
          fechaInicio:
            `${fechaInicio} 00:00:00`,
        },
      )
      .andWhere(
        'operacion.fechaRegistro <= :fechaFin',
        {
          fechaFin:
            `${fechaFin} 23:59:59`,
        },
      )
      .orderBy(
        'operacion.fechaRegistro',
        'DESC',
      )
      .getMany();
  }
}