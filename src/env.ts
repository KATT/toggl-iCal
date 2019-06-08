import { cleanEnv, num } from 'envalid';

export const createEnv = (env: NodeJS.ProcessEnv = process.env) => cleanEnv(env, {
  PORT: num({
    default: 24736,
  }),
}, {
  strict: true,
});


export const env = createEnv(process.env);

