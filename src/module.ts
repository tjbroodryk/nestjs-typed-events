import {
  DiscoveredClassWithMeta,
  DiscoveryModule,
  DiscoveryService,
} from '@golevelup/nestjs-discovery';
import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { WatcherMeta, EVENT_LISTENER, Watcher } from './decorator';
import { EventEmitter2, ConstructorOptions } from 'eventemitter2';
import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { EventSchema, Registry } from './types';
import { TypedEventEmitter } from './emitter';

const MODULE_OPTIONS = 'TypeEventEmitter.options';

type Options = {
  emitter?: ConstructorOptions;
  contract: Registry<any>;
};

@Module({
  imports: [DiscoveryModule],
  providers: [
    {
      provide: EventEmitter2,
      useFactory: (options: Options) => {
        return new EventEmitter2(options.emitter);
      },
      inject: [MODULE_OPTIONS],
    },
    {
      provide: TypedEventEmitter,
      useFactory: (emitter: EventEmitter2) => {
        return new TypedEventEmitter(emitter);
      },
      inject: [EventEmitter2],
    },
  ],
  exports: [TypedEventEmitter],
})
export class EventEmitterModule
  extends createConfigurableDynamicRootModule<EventEmitterModule, Options>(
    MODULE_OPTIONS,
  )
  implements OnModuleInit
{
  private readonly logger = new Logger(EventEmitterModule.name);

  constructor(
    private readonly discover: DiscoveryService,
    @Inject(MODULE_OPTIONS) private readonly options: Options,
    private readonly emitter: EventEmitter2,
  ) {
    super();
  }

  async onModuleInit() {
    const contractEvents = Object.entries(this.options.contract)
      .filter(([_, value]) => !value.optional)
      .map(([key]) => key);

    const providers = await this.discover.providersWithMetaAtKey<WatcherMeta>(
      EVENT_LISTENER,
    );

    this.ensureEachEventHasListener(contractEvents, providers);

    for (const provider of providers) {
      const instance = provider.discoveredClass
        .instance as Watcher<EventSchema>;
      const { event, options } = provider.meta;
      this.emitter.on(event, async (e) => {
        await instance.handle(options.schema.parse(e));
      });

      this.logger.log(`${provider.discoveredClass.name} {${event}}`);
    }
  }

  private ensureEachEventHasListener(
    events: string[],
    providers: DiscoveredClassWithMeta<WatcherMeta>[],
  ) {
    for (const event of events) {
      const provider = providers.find((p) => p.meta.event === event);

      if (!provider) {
        throw new Error(
          `Required event ${event} does not have a registered handler`,
        );
      }
    }
  }
}
