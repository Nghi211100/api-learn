import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
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

export class CreateUserDTO {
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @IsNotEmpty()
  @Length(6, 20)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
    {
      message:
        'Password must include: numbers, lowercase letters, uppercase letters, special characters, minimum 6 characters and maximum 20 characters',
    },
  )
  password: string;

  @IsNotEmpty()
  @Expose()
  firstName: string;

  @IsNotEmpty()
  @Expose()
  lastName: string;
}
