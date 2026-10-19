import dotenv from "dotenv";

dotenv.config({ quiet: true });

const env = {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,

  //   JWT TOKEN
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,

  //   REDIS URL
  REDIS_URL: process.env.REDIS_URL,

  //   SEAT LAYOUT
  ROW: process.env.ROW,
  COLUMN: process.env.COLUMN, 
};

export default env;
