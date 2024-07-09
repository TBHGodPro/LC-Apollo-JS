import { EventEmitter } from 'events';
import TypedEventEmitter from 'typed-emitter';
import { Any } from '@bufbuild/protobuf';
import packets from '../../special/packets';

export default class PacketReader extends (EventEmitter as new () => TypedEventEmitter<PacketReaderEvents>) {
  constructor() {
    super();
  }

  public read(packet: Uint8Array): void {
    const any = Any.fromBinary(packet);

    this.identifyAndEmit(any);
  }

  private identifyAndEmit(any: Any): void {
    for (const packet in packets) {
      try {
        if (any.is((packets as any)[packet])) {
          const instance = new (packets as any)[packet]();
          if (!any.unpackTo(instance)) return;
          this.emit('packet', { name: packet, data: instance } as any);
        }
      } catch {}
    }
  }
}

export type PacketReaderEvents = {
  //   packet<T extends keyof typeof packets>(name: T, data: (typeof packets)): void;
  packet: (
    data: ValueOf<{
      [T in keyof typeof packets]: {
        name: T;
        data: InstanceType<(typeof packets)[T]>;
      };
    }>
  ) => void;
};

type ValueOf<T> = T[keyof T];
