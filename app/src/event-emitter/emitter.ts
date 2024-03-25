import { EventEmitter } from 'events';

export const SupportEventEmitter = new EventEmitter();
SupportEventEmitter.setMaxListeners(1000);

console.log('new SupportEventEmitter', SupportEventEmitter);

export enum SupportEmitterEvents {
  MESSAGE_CREATED = 'message.created',
}
