import redis from 'async-redis';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

const REDIS__PORT = 6379;
const REDIS__STARTUP_MS = (1000 * 15);

describe("Check Redis Test Container Harness", () => {
  let container: StartedTestContainer;
  let redisClient: any;

  beforeAll(async () => {
    container = await new GenericContainer('redis')
      .withExposedPorts(REDIS__PORT)
      .withStartupTimeout(REDIS__STARTUP_MS)
      .start();

    (await container.logs())
      // .on('data', line => console.log(line))
      .on('err', line => console.error(line))
      .on('end', () => console.log("Stream closed"));

    redisClient = redis.createClient(
      container.getMappedPort(REDIS__PORT),
      container.getHost());
  });

  afterAll(async () => {
    await redisClient.quit();
    await container.stop();
  });

  it("works", async () => {
    await redisClient.set("key", "val");
    expect(await redisClient.get("key")).toBe("val");
  });
});
