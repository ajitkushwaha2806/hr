import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.warn("Redis: Maximum reconnection attempts reached. Giving up.");
        return new Error("Redis connection failed");
      }
      return Math.min(retries * 1000, 3000);
    },
    connectTimeout: 2000, 
  }
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis connected");
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message || error);
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

let isRedisDead = false;

export const connectRedis = async () => {
  if (isRedisDead) return;
  try {
    // If client is already open or currently connecting, skip calling connect()
    if (redisClient.isOpen || redisClient.isReady) {
      return;
    }
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connect failed:", err.message);
    isRedisDead = true; // Mark as dead so we don't block subsequent requests with long connection timeouts
  }
};

export default redisClient;