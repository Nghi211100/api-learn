import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserDTO } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete(':id')
  async deleteUserById(@Param('id') id: string): Promise<string> {
    try {
      await this.userService.deleteById(id);
      return 'Delete Successful!';
    } catch (error) {
      return 'An error occurred while deleting, please check id of user!';
    }
  }

  @Put(':id')
  async updateUserById(@Param('id') id: string, @Body() user: UserDTO) {
    try {
      await this.userService.updateUserById(id, user);
      return this.getUserById(id);
    } catch (error) {
      return 'An error occurred while updating, please check property or id of user!';
    }
  }

  @Post()
  createUser(@Body() user: UserDTO): UserDTO {
    const result = this.userService.saveUser(user);
    return plainToInstance(UserDTO, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  getUserById(@Param('id') id: string): UserDTO {
    const result = this.userService.getUserById(id);
    return plainToInstance(UserDTO, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async getAllUsers(): Promise<UserDTO[]> {
    const result = await this.userService.getAllUsers();
    const plainArray = result.map((res) =>
      plainToInstance(UserDTO, res, { excludeExtraneousValues: true }),
    );
    return plainArray;
  }
}
