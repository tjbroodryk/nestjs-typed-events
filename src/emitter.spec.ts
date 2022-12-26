import { EventContractBuilder } from './contract';
import { z } from 'zod';
import { EventEmitter2 } from 'eventemitter2';
import { TypedEventEmitter } from './emitter';

describe(TypedEventEmitter.name, () => {
  const contract = EventContractBuilder.create()
    .required(
      'test.event',
      z.object({
        foo: z.string(),
      }),
    )
    .required('other.event', z.string())
    .build();

  describe('typing', () => {
    it('should enforce correct args for event', () => {
      const emitter = new TypedEventEmitter<typeof contract>(
        new EventEmitter2(),
      );

      emitter.emit('test.event', {
        foo: 'bar',
      });

      //@ts-expect-error
      emitter.emit('test.event', {});

      emitter.emit('other.event', '');

      //@ts-expect-error
      emitter.emit('other.event', 1);
    });
  });
});
