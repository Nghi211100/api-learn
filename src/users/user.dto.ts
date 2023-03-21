import { Expose, Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { BaseDTO } from 'src/common/base.dto';
import { PostDTO } from 'src/posts/post.dto';

export class UserDTO extends BaseDTO {
  @Expose()
  email?: string;

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

  code_secret?: string;
}

export class TokenDTO {
  email: string;
  id: string;
}

export class TokenTFADTO {
  email: string;
  id: string;
  code: string;
}

export class UserLoginDTO {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
