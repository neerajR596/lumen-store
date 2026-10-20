import serverless from 'serverless-http';
import mongoose from 'mongoose';
import { config } from '../../server/src/config.js';
import { createApp, connectDB } from '../../server/src/index.js';

let handlerPromise;
const handler = async (event, context) => {
  if (!handlerPromise) {
    handlerPromise = connectDB(config.mongoUri).then(() => serverless(createApp()));
  }
  const run = await handlerPromise;
  return run(event, context);
};

export { handler };
