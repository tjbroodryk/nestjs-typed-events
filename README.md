<h1 align="center"></h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">NestJS Type Safe Event Emitter Module</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

Type Safe, contract-driven event emitter module for a NestJS application.

Uses [zod](https://github.com/colinhacks/zod) object defintions to create typesafe event listeners and emitter, with automatic validation of args.

## Features

- End-to-end type safe wrapper for `eventemitter2`
- Wild card events
- Enforce events have a listener via `contract.required(<event>, <schema>)`
- Optional event listeners via `contract.optional(<event>, <schema>)`

## Installation

```bash
npm i eventemitter2 nestjs-typed-events
```

## Limitations

- You can have multiple event listeners on one class **only** if the events have the same args signature.

## Example

1. Register in `app.module`

```typescript
import { EventContractBuilder, EventEmitterModule } from 'nestjs-typed-events';

const contract = EventContractBuilder.create()
  .required(
    'test.event',
    z.object({
      foo: z.string(),
    }),
  )
  .optional('optional.event', z.string())
  .build();

@Module({
  imports: [
    EventEmitterModule.forRoot(EventEmitterModule, {
      contract,
    }),
  ],
})
export class AppModule {}
```

2. Register your event listener

```typescript
import { Injectable } from '@nestjs/common';
import {
  EventListenerDecoratorFactory,
  ContractEvent,
} from 'nestjs-typed-events';

const ContractEvent = EventListenerDecoratorFactory(contract);

@Injectable()
@ContractEvent('test.event')
export class TestWatcher {
  async handle(args: ContractEvent<typeof contract['test.event']>) {}
}
```

3. Profit
