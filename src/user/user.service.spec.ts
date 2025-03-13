import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserDto } from './dtos/user.dtos';
import messages from './constants/messages';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let mockUser: User;

  beforeEach(async () => {
    userRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'example@gmail.com',
      password:
        'efdd7ee01b7b0501.66e0dd40f3b1feb84cba65d5672e8006336d53546bd395f7aa45d9343dee7fdb',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
  });

  it('should be defiend', () => {
    expect(userService).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user with provided id', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      const user = await userService.findById(mockUser.id);
      expect(user).toEqual(mockUser);
    });

    it('should return null if user was not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      const user = await userService.findById(mockUser.id);
      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user with provided email', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      const user = await userService.findByEmail(mockUser.email);
      expect(user).toEqual(mockUser);
    });

    it('should return null if user was not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      const user = await userService.findByEmail(mockUser.email);
      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return user', async () => {
      const userData: UserDto = {
        email: 'example@gmail.com',
        password: '12345',
      };

      userRepository.findOneBy.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const user = await userService.create(userData);
      expect(user).toEqual(mockUser);
    });

    it('should throw error if user with provided email exist', async () => {
      const userData: UserDto = {
        email: 'example@gmail.com',
        password: '12345',
      };
      userRepository.findOneBy.mockResolvedValue(mockUser);

      expect(userService.create(userData)).rejects.toThrow(
        new ConflictException(messages.userExist),
      );
    });
  });

  describe('updatePassword', () => {
    it('should update password and return updated user', async () => {
      const newPassword =
        'efdd7ee01b7b0501.66e0dd40f3b1feb84cba65d5672e8006336d53546bd395f7aa45d9343de14fd1';
      userRepository.findOneBy.mockResolvedValue(mockUser);

      Object.assign(mockUser, { password: newPassword });
      userRepository.save.mockResolvedValue(mockUser);

      const user = await userService.updatePassword(mockUser.id, newPassword);
      expect(user).toEqual(mockUser);
    });

    it('should throw error if user with provided id was not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      expect(userService.delete(mockUser.id)).rejects.toThrow(
        new NotFoundException(messages.userNotFoundById),
      );
    });
  });

  describe('delete', () => {
    it('should delete user with provided id', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);
      userRepository.remove.mockResolvedValue(mockUser);

      const user = await userService.delete(mockUser.id);
      expect(user).toEqual(mockUser);
    });

    it('should throw error if user with provided id was not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      expect(userService.delete(mockUser.id)).rejects.toThrow(
        new NotFoundException(messages.userNotFoundById),
      );
    });
  });
});
