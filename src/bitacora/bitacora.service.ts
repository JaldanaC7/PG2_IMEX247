import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bitacora } from './entities/bitacora.entity';
import { Operacion } from '../operaciones/entities/operacion.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BitacoraService {
  constructor(
    @InjectRepository(Bitacora)
    private readonly bitacoraRepository: Repository<Bitacora>,

    @InjectRepository(Operacion)
    private readonly operacionRepository: Repository<Operacion>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registrarCambio(
    operacionId: number,
    responsableId: number,
    estadoAnterior: string,
    estadoNuevo: string,
    observacion?: string,
  ): Promise<Bitacora> {
    const operacion = await this.operacionRepository.findOne({
      where: { id: operacionId },
    });

    if (!operacion) {
      throw new NotFoundException(
        `Operación con ID ${operacionId} no encontrada`,
      );
    }

    const responsable = await this.userRepository.findOne({
      where: { id: responsableId },
    });

    if (!responsable) {
      throw new NotFoundException(
        `Responsable con ID ${responsableId} no encontrado`,
      );
    }

    const registro = this.bitacoraRepository.create({
      operacion,
      responsable,
      estadoAnterior,
      estadoNuevo,
      observacion: observacion ?? null,
    });

    return this.bitacoraRepository.save(registro);
  }

  async registrarAvance(
    operacionId: number,
    responsableId: number,
    observacion: string,
  ): Promise<Bitacora> {
    const operacion = await this.operacionRepository.findOne({
      where: { id: operacionId },
    });

    if (!operacion) {
      throw new NotFoundException(
        `Operación con ID ${operacionId} no encontrada`,
      );
    }

    const responsable = await this.userRepository.findOne({
      where: { id: responsableId },
    });

    if (!responsable) {
      throw new NotFoundException(
        `Responsable con ID ${responsableId} no encontrado`,
      );
    }

    const registro = this.bitacoraRepository.create({
      operacion,
      responsable,
      estadoAnterior: operacion.estado,
      estadoNuevo: operacion.estado,
      observacion,
    });

    return this.bitacoraRepository.save(registro);
  }

  async findByOperacion(
    operacionId: number,
  ): Promise<Bitacora[]> {
    const operacion = await this.operacionRepository.findOne({
      where: { id: operacionId },
    });

    if (!operacion) {
      throw new NotFoundException(
        `Operación con ID ${operacionId} no encontrada`,
      );
    }

    return this.bitacoraRepository.find({
      where: {
        operacion: {
          id: operacionId,
        },
      },
      relations: {
        operacion: true,
        responsable: true,
      },
      order: {
        fechaRegistro: 'ASC',
      },
    });
  }
}