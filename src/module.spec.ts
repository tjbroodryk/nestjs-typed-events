import { EventEmitterModule } from './module';
import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { EventListenerDecoratorFactory } from './decorator';
import { EventContractBuilder } from './contract';
import { z } from 'zod';
import { ContractEvent, Registry } from './types';
import { TypedEventEmitter } from './emitter';

const contract = EventContractBuilder.create()
  .required(
    'test.event',
    z.object({
      foo: z.string(),
    }),
  )
  .optional('optional.event', z.object({}))
  .build();

const ContractEvent = EventListenerDecoratorFactory(contract);

const handleMock = jest.fn();

@Injectable()
@ContractEvent('test.event')
export class TestWatcher {
  async handle(props: ContractEvent<typeof contract['test.event']>) {
    handleMock(props);
  }
}

describe(EventEmitterModule.name, () => {
  describe('given event contract', () => {
    describe('when all required events have subscribers', () => {
      let emitter: TypedEventEmitter<typeof contract>;

      beforeAll(async () => {
        const deps = await createModule(contract);

        emitter = deps.emitter;
      });

      it('should register subscribers', () => {
        emitter.emit('test.event', {
          foo: 'bar',
        });

        expect(handleMock).toHaveBeenCalledTimes(1);
      });
    });
    describe('when some required subscribers are missing', () => {
      it('should throw', async () => {
        const contract = EventContractBuilder.create()
          .required(
            'test.required',
            z.object({
              foo: z.string(),
            }),
          )
          .build();
        await expect(
          async () => await createModule(contract),
        ).rejects.toThrow();
      });
    });
  });
});

async function createModule(contract: Registry<any>) {
  const module = await Test.createTestingModule({
    imports: [
      EventEmitterModule.forRoot(EventEmitterModule, {
        contract,
      }),
    ],
    providers: [TestWatcher],
  }).compile();

  const app = module.createNestApplication();
  await app.get(EventEmitterModule).onModuleInit();

  const emitter =
    app.get<TypedEventEmitter<typeof contract>>(TypedEventEmitter);

  return {
    emitter,
  };
}
