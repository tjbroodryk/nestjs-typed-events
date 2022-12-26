import { Entry, EventSchema, Registry } from './types';

export class EventContractBuilder<
  R extends EventSchema,
  T extends Registry<R> = {},
> {
  private constructor(private readonly jsonObject: T) {}

  static create<K extends EventSchema>(): EventContractBuilder<K> {
    return new EventContractBuilder({});
  }

  build(): T {
    return this.jsonObject;
  }

  required<K extends string, V extends R>(
    key: K,
    value: V,
  ): EventContractBuilder<R, T & { [k in K]: Entry<V> }> {
    const nextPart = {
      [key]: { schema: value, optional: false },
    } as Registry<V>;
    return new EventContractBuilder({ ...this.jsonObject, ...nextPart });
  }

  optional<K extends string, V extends R>(
    key: K,
    value: V,
  ): EventContractBuilder<R, T & { [k in K]: Entry<V> }> {
    const nextPart = {
      [key]: { schema: value, optional: true },
    };
    return new EventContractBuilder({ ...this.jsonObject, ...nextPart });
  }
}
