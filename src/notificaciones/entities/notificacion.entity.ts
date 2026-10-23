import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Operacion } from '../../operaciones/entities/operacion.entity';

export enum TipoNotificacion {
  DOCUMENTO_CLIENTE = 'DOCUMENTO_CLIENTE',
  CAMBIO_ESTADO = 'CAMBIO_ESTADO',
}

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  destinatario: User;

  @ManyToOne(() => Operacion, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  operacion: Operacion | null;

  @Column({
    type: 'enum',
    enum: TipoNotificacion,
  })
  tipo: TipoNotificacion;

  @Column({
    type: 'varchar',
    length: 500,
  })
  mensaje: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  leida: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;
}