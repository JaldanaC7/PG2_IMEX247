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

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CambiarContraseniaDto } from './dto/cambiar-contrasenia.dto';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolUsuario } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(
      createUserDto,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Get('responsables')
  async findResponsables() {
    return this.usersService.findResponsables();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Patch(':id/contrasenia')
  async cambiarContrasenia(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    cambiarContraseniaDto: CambiarContraseniaDto,
  ) {
    await this.usersService.cambiarContrasenia(
      id,
      cambiarContraseniaDto.contrasenia,
    );

    return {
      message:
        'Contraseña actualizada correctamente',
    };
  }
}