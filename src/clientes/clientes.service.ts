import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(
    createClienteDto: CreateClienteDto,
  ): Promise<Cliente> {
    // VALIDAR NIT DUPLICADO
    const clienteExistente =
      await this.clienteRepository.findOne({
        where: {
          nit: createClienteDto.nit,
        },
      });

    if (clienteExistente) {
      throw new ConflictException(
        `El NIT "${createClienteDto.nit}" ya está registrado`,
      );
    }

    const cliente =
      this.clienteRepository.create({
        nit: createClienteDto.nit,
        nombre: createClienteDto.nombre,
        correo: createClienteDto.correo,
        telefono: createClienteDto.telefono,
      });

    return this.clienteRepository.save(
      cliente,
    );
  }

  async findAll(): Promise<Cliente[]> {
    return this.clienteRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente =
      await this.clienteRepository.findOne({
        where: {
          id,
        },
      });

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${id} no encontrado`,
      );
    }

    return cliente;
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.findOne(id);

    // VALIDAR NIT DUPLICADO AL EDITAR
    if (
      updateClienteDto.nit !== undefined &&
      updateClienteDto.nit !== cliente.nit
    ) {
      const clienteConMismoNit =
        await this.clienteRepository.findOne({
          where: {
            nit: updateClienteDto.nit,
            id: Not(id),
          },
        });

      if (clienteConMismoNit) {
        throw new ConflictException(
          `El NIT "${updateClienteDto.nit}" ya está registrado`,
        );
      }
    }

    Object.assign(
      cliente,
      updateClienteDto,
    );

    return this.clienteRepository.save(
      cliente,
    );
  }
}