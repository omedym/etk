import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createId } from '@paralleldrive/cuid2';
import { StartedTestContainer } from 'testcontainers';

import { TrackedQueueRepository } from './TrackedQueueRepository';
import { RepositoryPostgresModule } from './repository-postgres.module';
import { TrackJobParams } from './types';

const TestConfig = {
  postgres: {
    port: process.env.TESTCONFIG__POSTGRES__PORT
      ? Number(process.env.TESTCONFIG__POSTGRES__PORT) : 5432,
      startupMs: process.env.TESTCONFIG__POSTGRES__STARTUP_MS
      ? Number(process.env.TESTCONFIG__POSTGRES__STARTUP_MS) : 15000,
  },
  jest: {
    timeoutMs: process.env.TESTCONFIG__JEST__TIMEOUT_MS
      ? Number(process.env.TESTCONFIG__JEST__TIMEOUT_MS) : 10000,
  },
};

describe('TrackedQueueRepository', () => {
  jest.setTimeout(TestConfig.jest.timeoutMs);

  let app: INestApplication;
  let container: StartedTestContainer;
  let SUT: TrackedQueueRepository;

  beforeAll(async ()  => {
    // container = await new GenericContainer('postgres')
    //   .withExposedPorts(TestConfig.postgres.port)
    //   .withStartupTimeout(TestConfig.postgres.startupMs)
    //   .start();

    const moduleRef = await Test.createTestingModule({
      imports: [
        RepositoryPostgresModule.forRoot({
          databaseUrl: `postgresql://postgres:postgres@localhost:5432/localdev`,
          assetBucket: ``,
        }),
      ],
      providers: [
        TrackedQueueRepository,
        // {
        //   provide: PostgresProviders.PRISMA,
        //   useValue: {},
        // },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    SUT = moduleRef.get<TrackedQueueRepository>(TrackedQueueRepository);

    await app.init();
  });

  describe('jobToTrack', () => {
    it('can be added to be tracked and has first event', async () => {
      type TestJobData = { id: string; };
      const testJobData = { id: createId() };

      const jobToTrack: TrackJobParams<TestJobData> = {
        tenantId: 'SYSTEM',
        queueGroupId: 'groupId',
        queueId: 'queueId',
        jobId: createId(),
        state: 'waiting',
        dataType: 'message',
        dataId: testJobData.id,
        data: testJobData,
      };

      const result = await SUT.trackJob(jobToTrack);

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        ...jobToTrack,
        events: [
          {
            tenantId: jobToTrack.tenantId,
            jobId: jobToTrack.jobId,
            state: jobToTrack.state,
          }
        ]
      });

      expect(result.createdAt).toEqual(result.updatedAt);
      expect(result.events![0].createdAt).toEqual(result.createdAt);
    });
  });
})
