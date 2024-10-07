import redis from 'async-redis';
import { GenericContainer, StartedTestContainer } from 'testcontainers';


const TestConfig = {
  redis: {
    port: process.env.TESTCONFIG__REDIS__PORT
      ? Number(process.env.TESTCONFIG__REDIS__PORT) : 6379,
    startupMs: process.env.TESTCONFIG__REDIS__STARTUP_MS
      ? Number(process.env.TESTCONFIG__REDIS__STARTUP_MS) : 1000 * 15,
  },
};

describe('Check Redis Test Container Harness', () => {
  let container: StartedTestContainer;
  let redisClient: any;

  beforeAll(async () => {
    container = await new GenericContainer('redis')
      .withExposedPorts(TestConfig.redis.port)
      .withStartupTimeout(TestConfig.redis.startupMs)
      .start();

    (await container.logs())
      // .on('data', line => console.log(line))
      .on('err', line => console.error(line))
      .on('end', () => console.log('Stream closed'));

    redisClient = redis.createClient(
      container.getMappedPort(TestConfig.redis.port),
      container.getHost());
  });

  afterAll(async () => {
    await redisClient.quit();
    await container.stop();
  });

  it('works', async () => {
    await redisClient.set('key', 'val');
    expect(await redisClient.get('key')).toBe('val');
  });
});
