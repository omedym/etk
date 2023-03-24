import { Test, TestingModule } from '@nestjs/testing';
import cuid from '@paralleldrive/cuid2';
import { DateTime } from 'luxon';

import { PostgresProviders, PrismaPostgresService } from '.';
import { TrackedQueueRepository } from './TrackedQueueRepository';
import { TrackJobParams } from './types';


describe('TrackedQueueRepository', () => {
  let service: TrackedQueueRepository;
  let now: DateTime = DateTime.now();

  describe('Module testing', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TrackedQueueRepository,
          {
            provide: PostgresProviders.PRISMA,
            useValue: {},
          },
        ],
      }).compile();

      service = module.get<TrackedQueueRepository>(TrackedQueueRepository);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('Service testing', () => {
    let SUT: TrackedQueueRepository;

    beforeEach(async () => {
      now = DateTime.now();

      const prisma = {
        save: jest.fn(),
        trackedQueueJob: {
          create: jest.fn().mockImplementation((jobToTrack: TrackJobParams) => {
            return {
              ...jobToTrack.data,
              createdAt: now.toJSDate(),
              updatedAt: now.toJSDate(),
            }
          }),
        },
      } as unknown as PrismaPostgresService;

      SUT = new TrackedQueueRepository(prisma);
    });

    it('can add a new job', async () => {
      type TestJobData = { id: string; };
      const testJobData = { id: cuid.createId() };

      const jobToTrack: TrackJobParams<TestJobData> = {
        tenantId: 'SYSTEM',
        queueGroupId: 'groupId',
        queueId: 'queueId',
        jobId: cuid.createId(),
        state: 'waiting',
        dataType: 'message',
        dataId: cuid.createId(),
        data: testJobData,
        metadata: undefined,
        result: undefined,
        log: null,
      };

      const result = await SUT.trackJob(jobToTrack);

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        ...jobToTrack,
        createdAt: now.toJSDate(),
        updatedAt: now.toJSDate(),
      });
    });
  });
});
