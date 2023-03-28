import { Runfiles } from '@bazel/runfiles';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createId } from '@paralleldrive/cuid2';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DateTime } from 'luxon';
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { StartedTestContainer } from 'testcontainers';

import { TrackedQueueRepository } from './TrackedQueueRepository';
import { RepositoryPostgresModule } from './repository-postgres.module';
import { TrackJobParams } from './types';


const TestConfig = {
  postgres: {
    port: process.env.TESTCONFIG__POSTGRES__PORT
      ? Number(process.env.TESTCONFIG__POSTGRES__PORT) : 5432,
    startupMs: process.env.TESTCONFIG__POSTGRES__STARTUP_MS
      ? Number(process.env.TESTCONFIG__POSTGRES__STARTUP_MS) : 1000 * 60,
    schema: 'dmq',
    userName: process.env.TESTCONFIG__POSTGRES__USER_NAME
      ? process.env.TESTCONFIG__POSTGRES__USER_NAME : 'postgres',
    userPassword: process.env.TESTCONFIG__POSTGRES__USER_PASSWORD
      ? process.env.TESTCONFIG__POSTGRES__USER_PASSWORD : 'postgres',
  },
  jest: {
    timeoutMs: process.env.TESTCONFIG__JEST__TIMEOUT_MS
      ? Number(process.env.TESTCONFIG__JEST__TIMEOUT_MS) : 1000 * 10,
  },
};

const runfiles = new Runfiles(process.env);
const execAsync = promisify(exec);

describe('TrackedQueueRepository', () => {
  jest.setTimeout(TestConfig.jest.timeoutMs);

  let app: INestApplication;
  let container: StartedPostgreSqlContainer;

  let DATABASE_URL_POSTGRES: string;
  let SUT: TrackedQueueRepository;

  const env = process.env;
  process.env = { ...env };

  beforeAll(async ()  => {
    const postgresDb = `test-${DateTime.now().toISO()}`;
    const postgresDbSchema = TestConfig.postgres.schema;

    /**
     * Derived from:
     *   - https://github.com/prisma/prisma/issues/13549#issuecomment-1432959733
     *   - https://github.com/andredesousa/nest-postgres-testcontainers/blob/main/e2e/specs/app.spec.ts
     */
    container = await new PostgreSqlContainer('postgres')
      .withDatabase(postgresDb)
      .withExposedPorts(TestConfig.postgres.port)
      .withPassword(TestConfig.postgres.userPassword)
      .withStartupTimeout(TestConfig.postgres.startupMs)
      .withUsername(TestConfig.postgres.userName)
      .start();

    const postgresHost = container.getHost();
    const postgresPort = container.getMappedPort(TestConfig.postgres.port);

    const prismaSchemaPath = runfiles.resolveWorkspaceRelative('packages/repository-postgres/prisma');
    const prismaSchemaFile = `${prismaSchemaPath}/schema.prisma`;

    // console.debug(`runFilesDir: ${runfiles.runfilesDir}`);
    // console.debug(`workspace: ${runfiles.workspace}`);
    // console.debug(`workspacePath: ${runfiles.resolveWorkspaceRelative('.')}`);
    // console.debug(`prismaSchemaPath: ${prismaSchemaPath}`);

    DATABASE_URL_POSTGRES = `postgresql://postgres`
      + `:postgres@${postgresHost}:${postgresPort}`
      + `/${postgresDb}?schema=${postgresDbSchema}`;

    const PRISMA_QUERY_ENGINE_LIBRARY = `${prismaSchemaPath}`;

    // process.env = { ...env,
    //   DATABASE_URL_POSTGRES,
    //   PRISMA_QUERY_ENGINE_LIBRARY
    // };

    const result = await execAsync(
      `npx prisma db push --schema "${prismaSchemaFile}" --skip-generate`,
      { env: { ...env, DATABASE_URL_POSTGRES, PRISMA_QUERY_ENGINE_LIBRARY }},
    );

    // console.debug(`execAsync.stderr: ${result?.stderr}`);
    // console.debug(`execAsync.stdout: ${result?.stdout}`);
    // console.debug('execAsync finished');

    const moduleRef = await Test.createTestingModule({
      imports: [
        RepositoryPostgresModule.forRoot({
          databaseUrl: DATABASE_URL_POSTGRES,
          assetBucket: ``,
        }),
      ],
      providers: [
        TrackedQueueRepository,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    SUT = moduleRef.get<TrackedQueueRepository>(TrackedQueueRepository);

    await app.init();
  }, 120000);

  // beforeEach(() => {
  //   jest.resetModules();
  //   process.env = { ...env, DATABASE_URL_POSTGRES };
  // });

  // afterEach(() => {
  //   process.env = env;
  // });

  afterAll(async () => {
    await app?.close();
    await container?.stop();
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
