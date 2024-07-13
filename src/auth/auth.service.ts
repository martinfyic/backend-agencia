import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import * as bcrypt from 'bcrypt';

import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  onModuleInit() {
    try {
      this.$connect();
      this.logger.log('Database connected');
    } catch (error) {
      this.logger.error('Fail to connect database, error: ', error);
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    if (registerUserDto.password !== registerUserDto.password2) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'The password does not match',
      });
    }

    try {
      const user = await this.user.findUnique({
        where: {
          email: registerUserDto.email,
        },
      });

      if (user) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User already exists',
        });
      }

      const registerUser = await this.user.create({
        data: {
          email: registerUserDto.email,
          lastName: registerUserDto.lastName.toLowerCase(),
          name: registerUserDto.name.toLowerCase(),
          password: bcrypt.hashSync(registerUserDto.password, 10),
          username: registerUserDto.username.toLowerCase() || undefined,
          address: registerUserDto.address
            ? { create: registerUserDto.address }
            : undefined,
          dateOfBirth: registerUserDto.dateOfBirth || undefined,
          lastLogin: new Date(),
          phone: registerUserDto.phone || undefined,
          profilePictureURL: registerUserDto.profilePictureURL || undefined,
        },
        include: {
          address: true,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...restUserData } = registerUser;

      // TODO: devolver token JWT cuando se registra el usuario.
      return {
        metadata: {
          status: HttpStatus.OK,
          date: new Date().toISOString(),
        },
        user: restUserData,
        token: '',
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  loginUser(loginUserDto: LoginUserDto) {
    return 'This action login user';
  }

  findAllUsers() {
    return `This action returns all auth`;
  }

  findOneUser(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error?.response?.status === HttpStatus.BAD_REQUEST)
      throw new BadRequestException(error.response);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
