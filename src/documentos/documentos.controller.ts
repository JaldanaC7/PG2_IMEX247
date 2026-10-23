import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import {
  existsSync,
  unlinkSync,
} from 'fs';
import type { Response } from 'express';

import { DocumentosService } from './documentos.service';
import { CambiarVisibilidadDocumentoDto } from './dto/cambiar-visibilidad-documento.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolUsuario } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

const configuracionCargaDocumentos = {
  storage: diskStorage({
    destination: './uploads',

    filename: (
      req: any,
      file: Express.Multer.File,
      callback: (
        error: Error | null,
        filename: string,
      ) => void,
    ) => {
      const extension = extname(
        file.originalname,
      );

      const nombreUnico =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9,
        )}${extension}`;

      callback(null, nombreUnico);
    },
  }),

  fileFilter: (
    req: any,
    file: Express.Multer.File,
    callback: (
      error: Error | null,
      acceptFile: boolean,
    ) => void,
  ) => {
    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (
      !tiposPermitidos.includes(
        file.mimetype,
      )
    ) {
      return callback(
        new BadRequestException(
          'Tipo de archivo no permitido. Solo se aceptan PDF, Word y Excel.',
        ),
        false,
      );
    }

    callback(null, true);
  },

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
};

@Controller('documentos')
export class DocumentosController {
  constructor(
    private readonly documentosService:
      DocumentosService,

    private readonly usersService:
      UsersService,
  ) {}

  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Get('operacion/:operacionId')
  findByOperacion(
    @Param(
      'operacionId',
      ParseIntPipe,
    )
    operacionId: number,
  ) {
    return this.documentosService.findByOperacion(
      operacionId,
    );
  }

  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(RolUsuario.CLIENTE)
  @Get(
    'portal/operacion/:operacionId',
  )
  async findDocumentosPortal(
    @Param(
      'operacionId',
      ParseIntPipe,
    )
    operacionId: number,

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

    return this.documentosService.findVisiblesByOperacionCliente(
      operacionId,
      usuario.cliente.id,
    );
  }

  /*
   * CARGA DE DOCUMENTOS DESDE EL PORTAL DEL CLIENTE
   */
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(RolUsuario.CLIENTE)
  @Post(
    'portal/operacion/:operacionId',
  )
  @UseInterceptors(
    FileInterceptor(
      'archivo',
      configuracionCargaDocumentos,
    ),
  )
  async registrarDocumentoPortal(
    @Param(
      'operacionId',
      ParseIntPipe,
    )
    operacionId: number,

    @UploadedFile()
    archivo: Express.Multer.File,

    @Body()
    body: Record<string, string>,

    @Req()
    req: any,
  ) {
    if (!archivo) {
      throw new BadRequestException(
        'El archivo es obligatorio',
      );
    }

    try {
      const usuario =
        await this.usersService.findByIdConCliente(
          req.user.id,
        );

      if (!usuario.cliente) {
        throw new ForbiddenException(
          'El usuario no tiene un cliente asociado',
        );
      }

      const tipoDocumento =
        body.tipoDocumento?.trim();

      if (!tipoDocumento) {
        throw new BadRequestException([
          'El tipo de documento es obligatorio',
        ]);
      }

      if (
        tipoDocumento.length > 100
      ) {
        throw new BadRequestException([
          'El tipo de documento no puede superar los 100 caracteres',
        ]);
      }

      return await this.documentosService.registrarDocumentoPortal(
        operacionId,
        req.user.id,
        usuario.cliente.id,
        tipoDocumento,
        archivo.originalname,
        archivo.filename,
        archivo.path,
        archivo.mimetype,
      );
    } catch (error) {
      const rutaArchivo =
        resolve(archivo.path);

      if (existsSync(rutaArchivo)) {
        unlinkSync(rutaArchivo);
      }

      throw error;
    }
  }

  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(RolUsuario.CLIENTE)
  @Get('portal/:id/descargar')
  async descargarDocumentoPortal(
    @Param('id', ParseIntPipe)
    id: number,

    @Req()
    req: any,

    @Res()
    res: Response,
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

    const documento =
      await this.documentosService.findOneVisibleByCliente(
        id,
        usuario.cliente.id,
      );

    const rutaCompleta =
      resolve(
        documento.rutaArchivo,
      );

    if (
      !existsSync(rutaCompleta)
    ) {
      throw new NotFoundException(
        'El archivo físico no fue encontrado',
      );
    }

    return res.download(
      rutaCompleta,
      documento.nombreOriginal,
    );
  }

  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Patch(
    ':id/visibilidad-cliente',
  )
  cambiarVisibilidadCliente(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    cambiarVisibilidadDocumentoDto:
      CambiarVisibilidadDocumentoDto,
  ) {
    return this.documentosService.cambiarVisibilidadCliente(
      id,
      cambiarVisibilidadDocumentoDto.visibleCliente,
    );
  }

  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Get(':id/descargar')
  async descargarDocumento(
    @Param('id', ParseIntPipe)
    id: number,

    @Res()
    res: Response,
  ) {
    const documento =
      await this.documentosService.findOne(
        id,
      );

    const rutaCompleta =
      resolve(
        documento.rutaArchivo,
      );

    if (
      !existsSync(rutaCompleta)
    ) {
      throw new NotFoundException(
        'El archivo físico no fue encontrado',
      );
    }

    return res.download(
      rutaCompleta,
      documento.nombreOriginal,
    );
  }

  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(
    RolUsuario.ADMIN,
    RolUsuario.OPERADOR,
  )
  @Post(
    'operacion/:operacionId',
  )
  @UseInterceptors(
    FileInterceptor(
      'archivo',
      configuracionCargaDocumentos,
    ),
  )
  async registrarDocumento(
    @Param(
      'operacionId',
      ParseIntPipe,
    )
    operacionId: number,

    @UploadedFile()
    archivo: Express.Multer.File,

    @Body()
    body: Record<string, string>,

    @Req()
    req: any,
  ) {
    if (!archivo) {
      throw new BadRequestException(
        'El archivo es obligatorio',
      );
    }

    try {
      const tipoDocumento =
        body.tipoDocumento?.trim();

      if (!tipoDocumento) {
        throw new BadRequestException([
          'El tipo de documento es obligatorio',
        ]);
      }

      if (
        tipoDocumento.length > 100
      ) {
        throw new BadRequestException([
          'El tipo de documento no puede superar los 100 caracteres',
        ]);
      }

      return await this.documentosService.registrarDocumento(
        operacionId,
        req.user.id,
        tipoDocumento,
        archivo.originalname,
        archivo.filename,
        archivo.path,
        archivo.mimetype,
      );
    } catch (error) {
      const rutaArchivo =
        resolve(archivo.path);

      if (
        existsSync(rutaArchivo)
      ) {
        unlinkSync(rutaArchivo);
      }

      throw error;
    }
  }
}