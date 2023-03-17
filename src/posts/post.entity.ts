import { BaseEntity } from 'src/common/base.entity';
import { UserEntity } from 'src/users/user.entity';
import { Column, Entity, JoinTable, ManyToOne } from 'typeorm';

@Entity('posts')
export class PostEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  @JoinTable()
  user: UserEntity;
}
