import { Expose, Transform } from 'class-transformer';
import { BaseDTO } from 'src/common/base.dto';
import { PostDTO } from 'src/posts/post.dto';

export class UserDTO extends BaseDTO {
  @Expose()
  userName?: string;

  password?: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  @Transform(({ obj }) => obj.firstName + ' ' + obj.lastName)
  fullName?;

  @Expose()
  role?: string;

  @Expose()
  isActive?: boolean;

  @Expose()
  posts?: PostDTO[];

  refresh_token?: string;
}

export class TokenDTO {
  userName: string;
  id: string;
}
