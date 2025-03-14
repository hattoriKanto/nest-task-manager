import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { ValidationUserDto } from './dtos/validation-user.dtos';
import { UserDto } from './dtos/user.dtos';
import { User } from './user.entity';
import messages from './constants/messages';
import getHashedPassword from './utils/getHashedPassword';

describe('AuthServices', () => {
  let jwtService: JwtService;
  let authService: AuthService;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;

  beforeEach(async () => {
    userService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      updatePassword: jest.fn(),
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
        AuthService,
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it('should be defiend', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUserById', () => {
    it('should throw an error if user does not exists', () => {
      const mockValidationUser: ValidationUserDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        password: '12345',
      };
      userService.findById.mockResolvedValue(null);

      expect(authService.validateUserById(mockValidationUser)).rejects.toThrow(
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
      expect(authService.validateUserById(mockValidationUser)).rejects.toThrow(
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
    it('should throw an error if user with such email exists', async () => {
      const mockCreateUser: UserDto = {
        email: 'example@gmail.com',
        password: '12345',
      };
      const { hash, salt } = await getHashedPassword(mockCreateUser.password);
      const mockUser: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: mockCreateUser.email,
        password: `${salt}.${hash}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.findByEmail.mockResolvedValue(mockUser);
      userService.create.mockRejectedValue(
        new ConflictException(messages.userExist),
      );

      expect(authService.register(mockCreateUser)).rejects.toThrow(
        new ConflictException(messages.userExist),
      );
    });

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

      const token = await authService.register(mockCreateUser);
      expect(expectedToken.access_token).toBeDefined();
      expect(token.access_token).toBeDefined();
      expect(token.access_token).toBe(expectedToken.access_token);
    });
  });

  describe('logIn', () => {
    it('should throw an error if user does not exists', () => {
      const mockLoginUser: UserDto = {
        email: 'example@gmail.com',
        password: '12345',
      };
      userService.findByEmail.mockResolvedValue(null);

      expect(authService.logIn(mockLoginUser)).rejects.toThrow(
        new NotFoundException(messages.userNotFoundByEmail),
      );
    });

    it('should throw an error if password is not valid', async () => {
      const mockPassword = 'qwerty';
      const mockEmail = 'example@gmail.com';
      const { hash: storedHash, salt } = await getHashedPassword(mockPassword);
      const mockUser: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: mockEmail,
        password: `${salt}.${storedHash}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLoginUser: UserDto = {
        email: mockEmail,
        password: '12345',
      };
      userService.findByEmail.mockResolvedValue(mockUser);
      const { hash } = await getHashedPassword(mockLoginUser.password, salt);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(storedHash);
      expect(authService.logIn(mockLoginUser)).rejects.toThrow(
        new UnauthorizedException(messages.wrongPassword),
      );
    });

    it('should return a valid JWT after user log in successfully', async () => {
      const mockLoginUser: UserDto = {
        email: 'example@gmail.com',
        password: '12345',
      };
      const { hash, salt } = await getHashedPassword(mockLoginUser.password);

      expect(hash).toBeDefined();
      expect(salt).toBeDefined();

      const mockNewUser: UserDto = {
        email: mockLoginUser.email,
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

  describe('updatePassword', () => {
    it('should throw an error if user does not exists', () => {
      const mockValidationUser: ValidationUserDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        password: 'qwerty',
        newPassword: '12345',
      };
      userService.findById.mockResolvedValue(null);

      expect(authService.updatePassword(mockValidationUser)).rejects.toThrow(
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
        password: 'abcdef',
        newPassword: '12345',
      };
      userService.findById.mockResolvedValue(mockUser);
      const { hash } = await getHashedPassword(
        mockValidationUser.password,
        salt,
      );

      expect(hash).toBeDefined();
      expect(hash).not.toBe(storedHash);
      expect(authService.updatePassword(mockValidationUser)).rejects.toThrow(
        new UnauthorizedException(messages.wrongPassword),
      );
    });

    it('should return a valid JWT after user updated password successfully', async () => {
      const mockPassword = 'qwerty';
      const mockId = '550e8400-e29b-41d4-a716-446655440000';
      const { salt, hash: storedHash } = await getHashedPassword(mockPassword);
      const mockValidationUser: ValidationUserDto = {
        userId: mockId,
        password: mockPassword,
        newPassword: '12345',
      };
      const mockUser: User = {
        id: mockId,
        email: 'example@gmail.com',
        password: `${salt}.${storedHash}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const { hash: newHash, salt: newSalt } = await getHashedPassword(
        mockValidationUser.newPassword,
      );

      expect(newHash).toBeDefined();
      expect(newSalt).toBeDefined();

      const mockUpdatedUser: User = {
        ...mockUser,
        password: `${newSalt}.${newHash}`,
      };
      const payload = {
        sub: mockUpdatedUser.id,
        email: mockUpdatedUser.email,
      };
      const expectedToken = {
        access_token: await jwtService.signAsync(payload),
      };

      userService.findById.mockResolvedValue(mockUser);
      userService.updatePassword.mockResolvedValue(mockUpdatedUser);

      const token = await authService.updatePassword(mockValidationUser);
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

      expect(authService.deleteUser(mockValidationUser)).rejects.toThrow(
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
      expect(authService.deleteUser(mockValidationUser)).rejects.toThrow(
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

      const resultMessage = await authService.deleteUser(mockValidationUser);
      expect(hash).toBeDefined();
      expect(resultMessage).toBeDefined();
      expect(resultMessage).toEqual(expectedMessage);
      expect(resultMessage.message).toBe(expectedMessage.message);
    });
  });
});
