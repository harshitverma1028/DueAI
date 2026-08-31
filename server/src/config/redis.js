import IORedis from "ioredis";

let redis = null;
let redisAvailable = false;

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    redis = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on("ready", () => {
      redisAvailable = true;
      console.log("[Redis] connected");
    });

    redis.on("error", () => {
      if (redisAvailable) {
        console.warn("[Redis] connection lost");
      }

      redisAvailable = false;
    });

    await redis.connect();
  } catch (error) {
    redis = null;
    redisAvailable = false;

    console.warn(
      "[Redis] unavailable - reminder worker disabled"
    );
  }
} else {
  console.log(
    "[Redis] REDIS_URL not configured - reminder worker disabled"
  );
}

export {
  redis,
  redisAvailable,
};
