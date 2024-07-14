import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto';
import { PaginationDto } from 'src/common/dto';
import { JwtPayloadInterface } from './interfaces';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  onModuleInit() {
    try {
      this.$connect();
      this.logger.log('Database connected');
    } catch (error) {
      this.logger.error('Fail to connect database, error: ', error);
    }
  }

  /**
   *
   * registerUser Registro de usuario
   *
   */
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

      return {
        metadata: {
          status: HttpStatus.OK,
          date: new Date().toISOString(),
        },
        user: restUserData,
        authToken: this.getJwtToken({ id: restUserData.id.toString() }),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   *
   * loginUser Login de usuario
   *
   */
  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const isValidUser = await this.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!isValidUser) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Credentials are no valid.',
      });
    }

    if (!bcrypt.compareSync(password, isValidUser.password)) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Credentials are no valid.',
      });
    }

    if (!isValidUser.isActive) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized, talk to admin.',
      });
    }

    const userData = await this.updateLastLogin(isValidUser.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...user } = userData;

    return {
      metadata: {
        date: new Date().toISOString(),
      },
      user: user,
      authToken: this.getJwtToken({ id: user.id.toString() }),
    };
  }

  /**
   *
   * findAllUsers Lista todos los usuarios activos
   *
   */
  async findAllUsers(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    try {
      const allUsers = await this.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          isActive: true,
        },
        include: {
          address: true,
        },
      });

      const totalRecords = await this.user.count({
        where: {
          isActive: true,
        },
      });
      const lastPage = Math.ceil(totalRecords / limit);

      if (page > lastPage) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: `Page ${page} not exist, last page is ${lastPage}`,
        });
      }

      return {
        metadata: {
          status: HttpStatus.OK,
          totalRecords: totalRecords,
          page: page,
          lastPage: lastPage,
          date: new Date().toISOString(),
        },
        data: allUsers.map((userData) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...user } = userData;
          return user;
        }),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   *
   * findOneUser Lista usuario por su id
   *
   */
  async findOneUser(id: number) {
    try {
      const userData = await this.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!userData) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User not exists',
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = userData;

      return {
        metadata: {
          status: HttpStatus.OK,
          date: new Date().toISOString(),
        },
        user: { ...user },
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   *
   * updateUser actualiza usuario por su id
   *
   */
  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    return {
      message: `This action updates a #${id} auth`,
      id,
      updateUserDto,
    };
  }

  /**
   *
   * removeUser soft delete de usuario por su id, modificamos isActiv = false
   *
   */
  async removeUser(id: number) {
    return `This action removes a #${id} auth`;
  }

  private async getJwtToken(payload: JwtPayloadInterface) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private async updateLastLogin(id: number) {
    return this.user.update({
      where: {
        id: id,
      },
      data: {
        lastLogin: new Date().toISOString(),
      },
    });
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.code === 'P2002')
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: `Field '${error.meta.target}' already exist`,
      });
    if (error?.response?.status === HttpStatus.BAD_REQUEST)
      throw new BadRequestException(error.response);
    if (error?.response?.status === HttpStatus.UNAUTHORIZED)
      throw new UnauthorizedException(error.response);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
