import { z } from 'zod';

export type ContractEvent<R extends Entry<EventSchema>> = z.output<R['schema']>;

export type EventSchema = z.ZodType<any, any, any>;

export type Registry<R extends EventSchema> = Record<string, Entry<R>>;

export type Entry<R extends EventSchema> = {
  schema: R;
  optional?: boolean;
};
