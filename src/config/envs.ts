import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DB_PASSWORD: string;
  DB_USERNAME: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    DB_PASSWORD: joi.string().required(),
    DB_USERNAME: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
};
