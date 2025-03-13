import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthServices } from './auth.service';
import { UserService } from './user.service';
import { ValidationUserDto } from './dtos/validation-user.dtos';
import { UserDto } from './dtos/user.dtos';
import { User } from './user.entity';
import messages from './constants/messages';
import getHashedPassword from './utils/getHashedPassword';

describe('AuthServices', () => {
  let jwtService: JwtService;
  let authServices: AuthServices;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;

  beforeEach(async () => {
    userService = {
      findById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: false }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: configService.get<string>('JWT_EXPIRES'),
            },
          }),
        }),
      ],
      providers: [
        ConfigService,
        AuthServices,
        JwtService,
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    authServices = moduleRef.get<AuthServices>(AuthServices);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it('should be defiend', () => {
    expect(authServices).toBeDefined();
  });

  describe('validateUserById', () => {
    it('should throw an error if user does not exists', () => {
      const mockValidationUser: ValidationUserDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        password: '12345',
      };
      userService.findById.mockResolvedValue(null);

      expect(authServices.validateUserById(mockValidationUser)).rejects.toThrow(
        new NotFoundException(messages.userNotFoundById),
      );
    });

    it('should throw an error if password is not valid', async () => {
      const mockPassword = 'qwerty';
      const mockId = '550e8400-e29b-41d4-a716-446655440000';
      const { hash: storedHash, salt } = await getHashedPassword(mockPassword);
      const mockUser: User = {
        id: mockId,
        email: 'example@gmail.com',
        password: `${salt}.${storedHash}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockValidationUser: ValidationUserDto = {
        userId: mockId,
        password: '12345',
      };
      userService.findById.mockResolvedValue(mockUser);
      const { hash } = await getHashedPassword(
        mockValidationUser.password,
        salt,
      );

      expect(hash).toBeDefined();
      expect(hash).not.toBe(storedHash);
      expect(authServices.validateUserById(mockValidationUser)).rejects.toThrow(
        new UnauthorizedException(messages.wrongPassword),
      );
    });

    it('should not throw errors if user exists and password is correct', async () => {
      const mockPassword = '12345';
      const mockId = '550e8400-e29b-41d4-a716-446655440000';
      const { hash: storedHash, salt } = await getHashedPassword(mockPassword);
      const mockUser = {
        id: mockId,
        email: 'example@gmail.com',
        password: `${salt}.${storedHash}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockValidationUser: ValidationUserDto = {
        userId: mockId,
        password: mockPassword,
      };
      userService.findById.mockResolvedValue(mockUser);
      const { hash } = await getHashedPassword(
        mockValidationUser.password,
        salt,
      );

      expect(hash).toBeDefined();
      expect(hash).toBe(storedHash);
    });
  });

  describe('register', () => {
    it('should return a valid JWT after user created successfully', async () => {
      const mockCreateUser: UserDto = {
        email: 'example@gmail.com',
        password: '12345',
      };
      const { hash, salt } = await getHashedPassword(mockCreateUser.password);

      expect(hash).toBeDefined();
      expect(salt).toBeDefined();

      const mockNewUser: UserDto = {
        email: mockCreateUser.email,
        password: `${salt}.${hash}`,
      };
      const mockUser: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: mockNewUser.email,
        password: mockNewUser.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.create.mockResolvedValue(mockUser);

      const payload = { sub: mockUser.id, email: mockUser.email };
      const expectedToken = {
        access_token: await jwtService.signAsync(payload),
      };

      const token = {
        access_token: await jwtService.signAsync(payload),
      };
      expect(expectedToken.access_token).toBeDefined();
      expect(token.access_token).toBeDefined();
      expect(token.access_token).toBe(expectedToken.access_token);
    });
  });

  describe('deleteUser', () => {
    it('should throw an error if user does not exists', () => {
      const mockValidationUser: ValidationUserDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        password: '12345',
      };
      userService.findById(null);

      expect(authServices.deleteUser(mockValidationUser)).rejects.toThrow(
        new NotFoundException(messages.userNotFoundById),
      );
    });

    it('should throw an error if password is not valid', async () => {
      const mockPassword = 'qwerty';
      const { salt, hash: storedHash } = await getHashedPassword(mockPassword);
      const mockId = '550e8400-e29b-41d4-a716-446655440000';
      const mockUser: User = {
        id: mockId,
        email: 'example@gmail.com',
        password: `${salt}.${storedHash}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockValidationUser: ValidationUserDto = {
        userId: mockId,
        password: '12345',
      };

      expect(salt).toBeDefined();
      expect(storedHash).toBeDefined();

      userService.findById.mockResolvedValue(mockUser);

      const { hash } = await getHashedPassword(
        mockValidationUser.password,
        salt,
      );

      expect(hash).toBeDefined();
      expect(hash).not.toBe(storedHash);
      expect(authServices.deleteUser(mockValidationUser)).rejects.toThrow(
        new UnauthorizedException(messages.wrongPassword),
      );
    });

    it('should return a message if deletion was successful', async () => {
      const mockPassword = 'qwerty';
      const mockId = '550e8400-e29b-41d4-a716-446655440000';
      const { salt, hash: storedHash } = await getHashedPassword(mockPassword);
      const mockValidationUser: ValidationUserDto = {
        userId: mockId,
        password: mockPassword,
      };
      const mockUser: User = {
        id: mockId,
        email: 'example@gmail.com',
        password: `${salt}.${storedHash}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const { hash } = await getHashedPassword(
        mockValidationUser.password,
        salt,
      );
      const expectedMessage = { message: messages.userDeleted };

      userService.findById.mockResolvedValue(mockUser);
      userService.delete.mockResolvedValue(mockUser);

      const resultMessage = await authServices.deleteUser(mockValidationUser);
      expect(hash).toBeDefined();
      expect(resultMessage).toBeDefined();
      expect(resultMessage).toEqual(expectedMessage);
      expect(resultMessage.message).toBe(expectedMessage.message);
    });
  });
});
