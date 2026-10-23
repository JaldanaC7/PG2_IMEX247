import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolUsuario } from '../users/entities/user.entity';

@Controller('clientes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(
  RolUsuario.ADMIN,
  RolUsuario.OPERADOR,
)
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
  ) {}

  @Post()
  create(
    @Body()
    createClienteDto: CreateClienteDto,
  ) {
    return this.clientesService.create(
      createClienteDto,
    );
  }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(
      id,
      updateClienteDto,
    );
  }
}