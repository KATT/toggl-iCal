import { cleanEnv, num, str } from 'envalid';
import { config } from 'dotenv'

config()
export const createEnv = (env: NodeJS.ProcessEnv = process.env) => cleanEnv(env, {
  PORT: num({
    default: 24736,
  }),
  TOGGL_API_TOKEN: str()
}, {
    strict: true,
  }
);


export const env = createEnv(process.env);

