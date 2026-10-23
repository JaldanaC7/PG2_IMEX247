import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import {
  RolUsuario,
  User,
} from './entities/user.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{
    id: number;
    usuario: string;
    rol: string;
    cliente: {
      id: number;
      nit: string;
      nombre: string;
    } | null;
  }> {
    let cliente: Cliente | null = null;

    const rol =
      createUserDto.rol ?? RolUsuario.OPERADOR;

    // VALIDAR NOMBRE DE USUARIO DUPLICADO
    const usuarioExistente =
      await this.userRepository.findOne({
        where: {
          usuario: createUserDto.usuario,
        },
      });

    if (usuarioExistente) {
      throw new ConflictException(
        `El nombre de usuario "${createUserDto.usuario}" ya está registrado`,
      );
    }

    // VALIDACIONES PARA USUARIOS CON ROL CLIENTE
    if (rol === RolUsuario.CLIENTE) {
      if (!createUserDto.clienteId) {
        throw new BadRequestException(
          'Debe seleccionar un cliente para crear un usuario con rol CLIENTE',
        );
      }

      cliente =
        await this.clienteRepository.findOne({
          where: {
            id: createUserDto.clienteId,
          },
        });

      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID ${createUserDto.clienteId} no encontrado`,
        );
      }

      if (!cliente.activo) {
        throw new BadRequestException(
          'No se puede asociar un usuario a un cliente inactivo',
        );
      }

      // VALIDAR QUE EL CLIENTE NO TENGA YA UNA CUENTA
      const usuarioClienteExistente =
        await this.userRepository.findOne({
          where: {
            cliente: {
              id: createUserDto.clienteId,
            },
          },
          relations: {
            cliente: true,
          },
        });

      if (usuarioClienteExistente) {
        throw new ConflictException(
          `El cliente "${cliente.nombre}" ya tiene un usuario asociado`,
        );
      }
    }

    // CIFRAR CONTRASEÑA
    const hashedPassword = await bcrypt.hash(
      createUserDto.contrasenia,
      10,
    );

    // CREAR USUARIO
    const user = this.userRepository.create({
      usuario: createUserDto.usuario,
      contrasenia: hashedPassword,
      rol,
      cliente:
        rol === RolUsuario.CLIENTE
          ? cliente
          : null,
    });

    const usuarioGuardado =
      await this.userRepository.save(user);

    return {
      id: usuarioGuardado.id,
      usuario: usuarioGuardado.usuario,
      rol: usuarioGuardado.rol,

      cliente: cliente
        ? {
            id: cliente.id,
            nit: cliente.nit,
            nombre: cliente.nombre,
          }
        : null,
    };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: {
        cliente: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findResponsables(): Promise<
    Array<{
      id: number;
      usuario: string;
      rol: RolUsuario;
    }>
  > {
    const responsables =
      await this.userRepository.find({
        where: {
          rol: In([
            RolUsuario.ADMIN,
            RolUsuario.OPERADOR,
          ]),
        },
        order: {
          usuario: 'ASC',
        },
      });

    return responsables.map(
      (responsable) => ({
        id: responsable.id,
        usuario: responsable.usuario,
        rol: responsable.rol,
      }),
    );
  }

  async findByUsuario(
    usuario: string,
  ): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.contrasenia')
      .where('user.usuario = :usuario', {
        usuario,
      })
      .getOne();
  }

  async findByIdConCliente(
    id: number,
  ): Promise<User> {
    const usuario =
      await this.userRepository.findOne({
        where: {
          id,
        },
        relations: {
          cliente: true,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${id} no encontrado`,
      );
    }

    return usuario;
  }

  async cambiarContrasenia(
    id: number,
    nuevaContrasenia: string,
  ): Promise<void> {
    const usuario =
      await this.userRepository.findOne({
        where: {
          id,
        },
      });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${id} no encontrado`,
      );
    }

    const hashedPassword = await bcrypt.hash(
      nuevaContrasenia,
      10,
    );

    await this.userRepository.update(id, {
      contrasenia: hashedPassword,
    });
  }
}