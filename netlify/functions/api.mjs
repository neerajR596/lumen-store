import serverless from 'serverless-http';
import { createApp, connectDB } from '../../server/src/index.js';

let handlerPromise;
const handler = async (event, context) => {
  if (!handlerPromise) {
    handlerPromise = connectDB().then(() => serverless(createApp()));
  }
  const run = await handlerPromise;
  return run(event, context);
};

export { handler };
