import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Documento } from './entities/documento.entity';
import { Operacion } from '../operaciones/entities/operacion.entity';
import { User } from '../users/entities/user.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,

    @InjectRepository(Operacion)
    private readonly operacionRepository: Repository<Operacion>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly notificacionesService: NotificacionesService,
  ) {}

  async registrarDocumento(
    operacionId: number,
    usuarioCargaId: number,
    tipoDocumento: string,
    nombreOriginal: string,
    nombreArchivo: string,
    rutaArchivo: string,
    mimeType: string,
  ): Promise<Documento> {
    const operacion =
      await this.operacionRepository.findOne({
        where: {
          id: operacionId,
        },
      });

    if (!operacion) {
      throw new NotFoundException(
        `Operación con ID ${operacionId} no encontrada`,
      );
    }

    const usuarioCarga =
      await this.userRepository.findOne({
        where: {
          id: usuarioCargaId,
        },
      });

    if (!usuarioCarga) {
      throw new NotFoundException(
        `Usuario con ID ${usuarioCargaId} no encontrado`,
      );
    }

    const documento =
      this.documentoRepository.create({
        operacion,
        usuarioCarga,
        tipoDocumento,
        nombreOriginal,
        nombreArchivo,
        rutaArchivo,
        mimeType,
      });

    return this.documentoRepository.save(
      documento,
    );
  }

  async registrarDocumentoPortal(
    operacionId: number,
    usuarioCargaId: number,
    clienteId: number,
    tipoDocumento: string,
    nombreOriginal: string,
    nombreArchivo: string,
    rutaArchivo: string,
    mimeType: string,
  ): Promise<Documento> {
    // La operación debe existir Y pertenecer al cliente autenticado.
    // También cargamos al responsable porque será uno de los
    // destinatarios de la notificación.
    const operacion =
      await this.operacionRepository.findOne({
        where: {
          id: operacionId,
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
        `Operación con ID ${operacionId} no encontrada`,
      );
    }

    const usuarioCarga =
      await this.userRepository.findOne({
        where: {
          id: usuarioCargaId,
        },
        relations: {
          cliente: true,
        },
      });

    if (!usuarioCarga) {
      throw new NotFoundException(
        `Usuario con ID ${usuarioCargaId} no encontrado`,
      );
    }

    const documento =
      this.documentoRepository.create({
        operacion,
        usuarioCarga,
        tipoDocumento,
        nombreOriginal,
        nombreArchivo,
        rutaArchivo,
        mimeType,

        // El cliente debe poder seguir viendo
        // el documento que él mismo cargó.
        visibleCliente: true,
      });

    const documentoGuardado =
      await this.documentoRepository.save(
        documento,
      );

    // Una vez almacenado correctamente el documento,
    // notificamos al responsable asignado y a los ADMIN.
    await this.notificacionesService.notificarDocumentoCliente(
      operacion,
    );

    return documentoGuardado;
  }

  async findByOperacion(
    operacionId: number,
  ): Promise<Documento[]> {
    const operacion =
      await this.operacionRepository.findOne({
        where: {
          id: operacionId,
        },
      });

    if (!operacion) {
      throw new NotFoundException(
        `Operación con ID ${operacionId} no encontrada`,
      );
    }

    return this.documentoRepository.find({
      where: {
        operacion: {
          id: operacionId,
        },
      },
      relations: {
        operacion: true,
        usuarioCarga: true,
      },
      order: {
        fechaCarga: 'DESC',
      },
    });
  }

  async findVisiblesByOperacionCliente(
    operacionId: number,
    clienteId: number,
  ) {
    const operacion =
      await this.operacionRepository.findOne({
        where: {
          id: operacionId,
          cliente: {
            id: clienteId,
          },
        },
      });

    if (!operacion) {
      throw new NotFoundException(
        `Operación con ID ${operacionId} no encontrada`,
      );
    }

    const documentos =
      await this.documentoRepository.find({
        where: {
          operacion: {
            id: operacionId,
          },
          visibleCliente: true,
        },
        order: {
          fechaCarga: 'DESC',
        },
      });

    return documentos.map(
      (documento) => ({
        id: documento.id,
        tipoDocumento:
          documento.tipoDocumento,
        nombreOriginal:
          documento.nombreOriginal,
        mimeType: documento.mimeType,
        fechaCarga: documento.fechaCarga,
      }),
    );
  }

  async findOneVisibleByCliente(
    id: number,
    clienteId: number,
  ): Promise<Documento> {
    const documento =
      await this.documentoRepository.findOne({
        where: {
          id,
          visibleCliente: true,
          operacion: {
            cliente: {
              id: clienteId,
            },
          },
        },
        relations: {
          operacion: true,
        },
      });

    if (!documento) {
      throw new NotFoundException(
        `Documento con ID ${id} no encontrado`,
      );
    }

    return documento;
  }

  async findOne(
    id: number,
  ): Promise<Documento> {
    const documento =
      await this.documentoRepository.findOne({
        where: {
          id,
        },
        relations: {
          operacion: true,
          usuarioCarga: true,
        },
      });

    if (!documento) {
      throw new NotFoundException(
        `Documento con ID ${id} no encontrado`,
      );
    }

    return documento;
  }

  async cambiarVisibilidadCliente(
    id: number,
    visibleCliente: boolean,
  ): Promise<Documento> {
    const documento =
      await this.findOne(id);

    documento.visibleCliente =
      visibleCliente;

    return this.documentoRepository.save(
      documento,
    );
  }
}