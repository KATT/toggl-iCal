import { cleanEnv, num, str } from 'envalid';

export const createEnv = (env: NodeJS.ProcessEnv = process.env) => cleanEnv(env, {
  TOGGL_API_TOKEN: str()
}, {
    strict: true,
  }
);


export const env = createEnv(process.env);

