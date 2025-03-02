import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskServices } from '../task.services';
import { Task } from '../task.entity';
import { TaskDto } from '../dtos/task.dto';

describe('TaskServices', () => {
  let taskServices: TaskServices;
  let taskRepository: Partial<Record<keyof Repository<Task>, jest.Mock>>;

  beforeEach(async () => {
    taskRepository = {
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TaskServices,
        { provide: getRepositoryToken(Task), useValue: taskRepository },
      ],
    }).compile();

    taskServices = moduleRef.get<TaskServices>(TaskServices);
  });

  it('should be defiend', () => {
    expect(taskServices).toBeDefined();
  });

  it('should return a task with provided id', async () => {
    const mockTask: Task = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Implement User Authentication',
      description:
        'Develop the backend service for user authentication, including JWT token generation and password hashing.',
      creationDate: '2025-03-02T10:00:00Z',
      endingDate: '2025-03-10T18:00:00Z',
      actualEndDate: null,
      priority: 'normal',
    };
    taskRepository.findOneBy.mockResolvedValue(mockTask);

    const task = await taskServices.findOneById(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    expect(task).toEqual(mockTask);
  });

  it('should return null if task was not found', async () => {
    taskRepository.findOneBy.mockResolvedValue(null);

    const task = await taskServices.findOneById(
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    );
    expect(task).toBeNull();
  });

  it('should return all tasks', async () => {
    const mockTasks: Task[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Implement User Authentication',
        description:
          'Create a JWT-based authentication system with refresh tokens.',
        creationDate: '2025-03-02T10:00:00Z',
        endingDate: '2025-03-09T18:00:00Z',
        actualEndDate: null,
        priority: 'low',
      },
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'Database Schema Design',
        description:
          'Design and document the database schema for the new project.',
        creationDate: '2025-03-02T11:00:00Z',
        endingDate: '2025-03-05T18:00:00Z',
        actualEndDate: null,
        priority: 'normal',
      },
      {
        id: '0987f654-e321-0dcb-a987-654321fedcba',
        title: 'Write Unit Tests',
        description: 'Implement unit tests for the authentication module.',
        creationDate: '2025-03-02T12:00:00Z',
        endingDate: '2025-03-07T18:00:00Z',
        actualEndDate: '2025-03-04T15:00:00Z',
        priority: 'urgent',
      },
    ];
    taskRepository.find.mockResolvedValue(mockTasks);

    const tasks = await taskServices.findAll();
    expect(tasks).toEqual(mockTasks);
  });

  it('should return an empty array if no tasks was found', async () => {
    taskRepository.find.mockResolvedValue([]);

    const tasks = await taskServices.findAll();
    expect(tasks).toEqual([]);
  });

  it('should create and return task', async () => {
    const mockTaskData: TaskDto = {
      title: 'Implement User Authentication',
      description:
        'Develop the backend service for user authentication, including JWT token generation and password hashing.',
      creationDate: '2025-03-02T10:00:00Z',
      endingDate: '2025-03-10T18:00:00Z',
      actualEndDate: null,
      priority: 'low',
    };
    const mockTask: Task = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Implement User Authentication',
      description:
        'Develop the backend service for user authentication, including JWT token generation and password hashing.',
      creationDate: '2025-03-02T10:00:00Z',
      endingDate: '2025-03-10T18:00:00Z',
      actualEndDate: null,
      priority: 'low',
    };
    taskRepository.create.mockReturnValue(mockTask);
    taskRepository.save.mockResolvedValue(mockTask);

    const task = await taskServices.create(mockTaskData);
    expect(task).toEqual(mockTask);
  });

  describe('update', () => {
    // test update method
  });

  describe('deleteById', () => {
    // test deleteById method
  });
});
