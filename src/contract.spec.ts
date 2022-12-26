import { EventContractBuilder } from './contract';
import { ZodType, z } from 'zod';

describe(EventContractBuilder.name, () => {
  describe('given multiple events', () => {
    describe('when they have the same name', () => {
      it('should overrite the first', () => {
        const contract = EventContractBuilder.create()
          .required('test.event', z.object({}))
          .optional('test.event', z.object({}))
          .build();

        expect(contract['test.event'].optional).toBeTruthy();
      });
    });

    describe('when they have different names', () => {
      it('should create contract containing all events', () => {
        const contract = EventContractBuilder.create()
          .required('test.event', z.object({}))
          .required('test.event.other', z.object({}))
          .build();

        expect(contract['test.event']).toEqual({
          optional: false,
          schema: expect.any(ZodType),
        });
        expect(contract['test.event.other']).toEqual({
          optional: false,
          schema: expect.any(ZodType),
        });
      });
    });
  });

  describe('given required event', () => {
    it('should mark event as required', () => {
      const contract = EventContractBuilder.create()
        .required('test.event', z.object({}))
        .build();

      expect(contract['test.event'].optional).toBeFalsy();
    });
  });

  describe('given optional event', () => {
    it('should mark event as optional', () => {
      const contract = EventContractBuilder.create()
        .optional('test.event', z.object({}))
        .build();

      expect(contract['test.event'].optional).toBeTruthy();
    });
  });
});
