import { EventSchema, Registry } from './types';
import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';

export class TypedEventEmitter<R extends Registry<any>> {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit<Key extends keyof R & string>(
    event: Key,
    props: z.input<R[Key]['schema']>,
  ) {
    return this.eventEmitter.emit(event, props);
  }
}
