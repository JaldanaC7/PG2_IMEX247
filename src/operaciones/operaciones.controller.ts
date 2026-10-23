import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { OperacionesService } from './operaciones.service';
import { CreateOperacionDto } from './dto/create-operacion.dto';
import { UpdateOperacionDto } from './dto/update-operacion.dto/update-operacion.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolUsuario } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Controller('operaciones')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OperacionesController {
  constructor(
    private readonly operacionesService: OperacionesService,
    private readonly usersService: UsersService,
  ) {}

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Post()
  create(
    @Body()
    createOperacionDto: CreateOperacionDto,
  ) {
    return this.operacionesService.create(
      createOperacionDto,
    );
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Get()
  findAll(
    @Query('codigo')
    codigo?: string,

    @Query(
      'clienteId',
      new ParseIntPipe({ optional: true }),
    )
    clienteId?: number,

    @Query('estado')
    estado?: string,

    @Query(
      'responsableId',
      new ParseIntPipe({ optional: true }),
    )
    responsableId?: number,

    @Query('fechaInicio')
    fechaInicio?: string,

    @Query('fechaFin')
    fechaFin?: string,
  ) {
    return this.operacionesService.findAll(
      codigo,
      clienteId,
      estado,
      responsableId,
      fechaInicio,
      fechaFin,
    );
  }

  @Roles(RolUsuario.CLIENTE)
  @Get('portal/mis-operaciones')
  async findMisOperaciones(
    @Req()
    req: any,
  ) {
    const usuario =
      await this.usersService.findByIdConCliente(
        req.user.id,
      );

    if (!usuario.cliente) {
      throw new ForbiddenException(
        'El usuario no tiene un cliente asociado',
      );
    }

    return this.operacionesService.findByCliente(
      usuario.cliente.id,
    );
  }

  @Roles(RolUsuario.CLIENTE)
  @Get('portal/mis-operaciones/:id')
  async findMiOperacion(
    @Param('id', ParseIntPipe)
    id: number,
    @Req()
    req: any,
  ) {
    const usuario =
      await this.usersService.findByIdConCliente(
        req.user.id,
      );

    if (!usuario.cliente) {
      throw new ForbiddenException(
        'El usuario no tiene un cliente asociado',
      );
    }

    return this.operacionesService.findOneByCliente(
      id,
      usuario.cliente.id,
    );
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.operacionesService.findOne(id);
  }

  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateOperacionDto: UpdateOperacionDto,
    @Req()
    req: any,
  ) {
    return this.operacionesService.update(
      id,
      updateOperacionDto,
      req.user.id,
    );
  }
}