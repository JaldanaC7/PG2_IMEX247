import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Operacion } from '../../operaciones/entities/operacion.entity';
import { User } from '../../users/entities/user.entity';

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Operacion, { nullable: false })
  operacion: Operacion;

  @Column({
    type: 'varchar',
    length: 100,
  })
  tipoDocumento: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  nombreOriginal: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  nombreArchivo: string;

  @Column({
    type: 'varchar',
    length: 500,
  })
  rutaArchivo: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  mimeType: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  visibleCliente: boolean;

  @ManyToOne(() => User, { nullable: false })
  usuarioCarga: User;

  @CreateDateColumn()
  fechaCarga: Date;
}