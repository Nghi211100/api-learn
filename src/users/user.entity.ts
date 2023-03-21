import { BaseEntity } from 'src/common/base.entity';
import { PostEntity } from 'src/posts/post.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ length: '50' })
  firstName: string;

  @Column({ length: '50' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'customer'],
    default: 'customer',
  })
  role: string;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @Column({ default: null })
  refresh_token: string;

  @Column({ default: null })
  code_secret: string;
}
