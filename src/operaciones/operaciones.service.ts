import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Operacion } from './entities/operacion.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { User } from '../users/entities/user.entity';
import { BitacoraService } from '../bitacora/bitacora.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateOperacionDto } from './dto/create-operacion.dto';
import { UpdateOperacionDto } from './dto/update-operacion.dto/update-operacion.dto';

@Injectable()
export class OperacionesService {
  constructor(
    @InjectRepository(Operacion)
    private readonly operacionRepository: Repository<Operacion>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly bitacoraService: BitacoraService,

    private readonly notificacionesService: NotificacionesService,
  ) {}

  async create(
    createOperacionDto: CreateOperacionDto,
  ): Promise<Operacion> {
    // VALIDAR CÓDIGO DE OPERACIÓN DUPLICADO
    const operacionExistente =
      await this.operacionRepository.findOne({
        where: {
          codigo: createOperacionDto.codigo,
        },
      });

    if (operacionExistente) {
      throw new ConflictException(
        `El código de operación "${createOperacionDto.codigo}" ya está registrado`,
      );
    }

    // VALIDAR CLIENTE
    const cliente =
      await this.clienteRepository.findOne({
        where: {
          id: createOperacionDto.clienteId,
        },
      });

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${createOperacionDto.clienteId} no encontrado`,
      );
    }

    // VALIDAR RESPONSABLE
    const responsable =
      await this.userRepository.findOne({
        where: {
          id: createOperacionDto.responsableId,
        },
      });

    if (!responsable) {
      throw new NotFoundException(
        `Responsable con ID ${createOperacionDto.responsableId} no encontrado`,
      );
    }

    const operacion =
      this.operacionRepository.create({
        codigo: createOperacionDto.codigo,
        cliente,
        tipoServicio:
          createOperacionDto.tipoServicio,
        responsable,
      });

    return this.operacionRepository.save(
      operacion,
    );
  }

  async findAll(
    codigo?: string,
    clienteId?: number,
    estado?: string,
    responsableId?: number,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<Operacion[]> {
    const query =
      this.operacionRepository
        .createQueryBuilder('operacion')
        .leftJoinAndSelect(
          'operacion.cliente',
          'cliente',
        )
        .leftJoinAndSelect(
          'operacion.responsable',
          'responsable',
        );

    const codigoLimpio = codigo?.trim();
    const estadoLimpio = estado?.trim();
    const fechaInicioLimpia =
      fechaInicio?.trim();
    const fechaFinLimpia =
      fechaFin?.trim();

    if (codigoLimpio) {
      query.andWhere(
        'operacion.codigo LIKE :codigo',
        {
          codigo: `%${codigoLimpio}%`,
        },
      );
    }

    if (clienteId !== undefined) {
      query.andWhere(
        'cliente.id = :clienteId',
        {
          clienteId,
        },
      );
    }

    if (estadoLimpio) {
      query.andWhere(
        'operacion.estado = :estado',
        {
          estado: estadoLimpio,
        },
      );
    }

    if (responsableId !== undefined) {
      query.andWhere(
        'responsable.id = :responsableId',
        {
          responsableId,
        },
      );
    }

    if (fechaInicioLimpia) {
      query.andWhere(
        'DATE(operacion.fechaRegistro) >= :fechaInicio',
        {
          fechaInicio: fechaInicioLimpia,
        },
      );
    }

    if (fechaFinLimpia) {
      query.andWhere(
        'DATE(operacion.fechaRegistro) <= :fechaFin',
        {
          fechaFin: fechaFinLimpia,
        },
      );
    }

    return query
      .orderBy('operacion.id', 'ASC')
      .getMany();
  }

  async findByCliente(
    clienteId: number,
  ): Promise<Operacion[]> {
    return this.operacionRepository.find({
      where: {
        cliente: {
          id: clienteId,
        },
      },
      relations: {
        cliente: true,
        responsable: true,
      },
      order: {
        fechaRegistro: 'DESC',
      },
    });
  }

  async findOneByCliente(
    id: number,
    clienteId: number,
  ): Promise<Operacion> {
    const operacion =
      await this.operacionRepository.findOne({
        where: {
          id,
          cliente: {
            id: clienteId,
          },
        },
        relations: {
          cliente: true,
          responsable: true,
        },
      });

    if (!operacion) {
      throw new NotFoundException(
        `Operación con ID ${id} no encontrada`,
      );
    }

    return operacion;
  }

  async findOne(
    id: number,
  ): Promise<Operacion> {
    const operacion =
      await this.operacionRepository.findOne({
        where: {
          id,
        },
        relations: {
          cliente: true,
          responsable: true,
        },
      });

    if (!operacion) {
      throw new NotFoundException(
        `Operación con ID ${id} no encontrada`,
      );
    }

    return operacion;
  }

  async update(
    id: number,
    updateOperacionDto: UpdateOperacionDto,
    usuarioAutenticadoId: number,
  ): Promise<Operacion> {
    const operacion = await this.findOne(id);

    // GUARDAR ESTADO ANTERIOR ANTES DE MODIFICAR
    const estadoAnterior =
      operacion.estado;

    // VALIDAR CÓDIGO DUPLICADO AL EDITAR
    if (
      updateOperacionDto.codigo !==
        undefined &&
      updateOperacionDto.codigo !==
        operacion.codigo
    ) {
      const operacionConMismoCodigo =
        await this.operacionRepository.findOne({
          where: {
            codigo:
              updateOperacionDto.codigo,
            id: Not(id),
          },
        });

      if (operacionConMismoCodigo) {
        throw new ConflictException(
          `El código de operación "${updateOperacionDto.codigo}" ya está registrado`,
        );
      }
    }

    // VALIDAR Y ACTUALIZAR CLIENTE
    if (
      updateOperacionDto.clienteId !==
      undefined
    ) {
      const cliente =
        await this.clienteRepository.findOne({
          where: {
            id: updateOperacionDto.clienteId,
          },
        });

      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID ${updateOperacionDto.clienteId} no encontrado`,
        );
      }

      operacion.cliente = cliente;
    }

    // VALIDAR Y ACTUALIZAR RESPONSABLE
    if (
      updateOperacionDto.responsableId !==
      undefined
    ) {
      const responsable =
        await this.userRepository.findOne({
          where: {
            id: updateOperacionDto.responsableId,
          },
        });

      if (!responsable) {
        throw new NotFoundException(
          `Responsable con ID ${updateOperacionDto.responsableId} no encontrado`,
        );
      }

      operacion.responsable =
        responsable;
    }

    // ACTUALIZAR CÓDIGO
    if (
      updateOperacionDto.codigo !==
      undefined
    ) {
      operacion.codigo =
        updateOperacionDto.codigo;
    }

    // ACTUALIZAR TIPO DE SERVICIO
    if (
      updateOperacionDto.tipoServicio !==
      undefined
    ) {
      operacion.tipoServicio =
        updateOperacionDto.tipoServicio;
    }

    // ACTUALIZAR ESTADO
    if (
      updateOperacionDto.estado !==
      undefined
    ) {
      operacion.estado =
        updateOperacionDto.estado;
    }

    // GUARDAR CAMBIOS
    const operacionActualizada =
      await this.operacionRepository.save(
        operacion,
      );

    // REGISTRAR EN BITÁCORA Y NOTIFICAR
    // ÚNICAMENTE SI EL ESTADO CAMBIÓ REALMENTE.
    if (
      updateOperacionDto.estado !==
        undefined &&
      estadoAnterior !==
        updateOperacionDto.estado
    ) {
      await this.bitacoraService.registrarCambio(
        operacionActualizada.id,
        usuarioAutenticadoId,
        estadoAnterior,
        updateOperacionDto.estado,
        updateOperacionDto.observacion,
      );

      await this.notificacionesService.notificarCambioEstado(
        operacionActualizada,
        estadoAnterior,
        updateOperacionDto.estado,
      );
    }

    return operacionActualizada;
  }
}