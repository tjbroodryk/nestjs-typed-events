import { SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { Constructor } from 'type-fest';
import { z } from 'zod';
import { Entry, EventSchema, Registry } from './types';

export const EVENT_LISTENER = 'TypedEventEmitter_listener';

export type Watcher<T extends EventSchema> = {
  handle(event: z.output<T>): Promise<void>;
};

export type WatcherMeta = {
  event: string;
  options: Entry<EventSchema>;
};

export function EventListener<
  Resource extends EventSchema,
  R extends Registry<Resource>,
  ResourceKey extends keyof R & string,
>(contract: R, resource: ResourceKey) {
  return (target: Constructor<Watcher<R[ResourceKey]['schema']>>) => {
    SetMetadata<string, WatcherMeta>(SCOPE_OPTIONS_METADATA, {
      options: contract[resource],
      event: resource,
    })(target);
    SetMetadata<string, WatcherMeta>(EVENT_LISTENER, {
      options: contract[resource],
      event: resource,
    })(target);
  };
}

export const EventListenerDecoratorFactory =
  <Resource extends EventSchema, R extends Registry<Resource>>(contract: R) =>
  <ResourceKey extends keyof R & string>(key: ResourceKey) => {
    return EventListener(contract, key);
  };
