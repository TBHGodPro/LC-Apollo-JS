import { UUID } from '@minecraft-js/uuid';
import { ApolloPluginChannel, TeamMember, Waypoint, Icon, Cooldown } from './constants';
import PacketReader from './packets/PacketReader';
import { Any, Duration, Message, Value } from '@bufbuild/protobuf';
import { DisableStaffModsMessage, DisplayCooldownMessage, DisplayNotificationMessage, DisplayWaypointMessage, EnableStaffModsMessage, OverrideConfigurableSettingsMessage, OverrideGlowEffectMessage, OverrideNametagMessage, PlayerHandshakeMessage, RemoveCooldownMessage, RemoveWaypointMessage, ResetCooldownsMessage, ResetGlowEffectMessage, ResetGlowEffectsMessage, ResetNametagMessage, ResetNametagsMessage, ResetWaypointsMessage, UpdateTeamMembersMessage } from '../special/packets';
import { EasyValue, StaffMod } from './packets/types';
import { adventureJSONText, convertTeamMember, getIconObject, getUUIDObject, msToDuration, parseValue } from './utils';
import { AdvancedResourceLocationIcon, Color, ItemStackIcon, Location, SimpleResourceLocationIcon } from './packets/extra';
import EventEmitter = require('events');
import TypedEventEmitter from 'typed-emitter';

export default class Player extends (EventEmitter as new () => TypedEventEmitter<PlayerEvents>) {
  public isConnected: boolean;

  public readonly channel: ApolloPluginChannel;

  public readonly options: PlayerOptions;

  public readonly handling: {
    registerPluginChannel: (channel: string) => void;
    sendPacket: (channel: string, bytes: Buffer) => boolean;
  };

  public queue: Buffer[] = [];

  public readonly reader: PacketReader;

  public hasReceivedHandshake: boolean = false;

  public readonly teamMembers: Map<UUID, TeamMember> = new Map();

  constructor(options: PlayerOptions) {
    super();

    options.channelAlreadyRegistered = options.channelAlreadyRegistered ? true : false;
    options.pluginChannel ??= ApolloPluginChannel.DEFAULT;

    this.options = options;

    this.isConnected = options.channelAlreadyRegistered;
    this.channel = options.pluginChannel;
    this.handling = options.handling;

    this.reader = new PacketReader();

    this.reader.on('packet', ({ name, data }) => {
      if (name === 'PlayerHandshakeMessage' && !this.hasReceivedHandshake) {
        this.hasReceivedHandshake = true;
        this.emit('handshake', data);

        for (const packet of this.queue) this.handling.sendPacket(this.channel, packet);
        this.queue = [];
      }
    });
  }

  public connect(): void {
    this.hasReceivedHandshake = false;
    this.registerPluginChannels();
  }

  private registerPluginChannels(): void {
    this.handling.registerPluginChannel(this.channel);
    this.isConnected = true;
  }

  public receivePacket(packet: Buffer | Uint8Array | ArrayBufferLike | ArrayLike<number>): void {
    this.reader.read(new Uint8Array(packet));
  }

  public sendPacket(packet: Message): void {
    const buf = Buffer.from(Any.pack(packet).toBinary());
    if (this.hasReceivedHandshake) {
      const success = this.handling.sendPacket(this.channel, buf);
      if (!success) this.queue.push(buf);
    } else this.queue.push(buf);
  }

  public configureSettings(
    ...settings: {
      target: string;
      case: 'lunarClientMod' | 'apolloModule';
      enabled: boolean;
      properties?: { [key: string]: EasyValue };
    }[]
  ): void {
    const packet = new OverrideConfigurableSettingsMessage({
      configurableSettings: settings.map(setting => {
        const parsedProperties = {} as {
          [key: string]: Value;
        };

        if (setting.properties) {
          for (const key in setting.properties) {
            parsedProperties[key] = parseValue(setting.properties[key]);
          }
        }

        return {
          target: {
            case: setting.case,
            value: setting.target,
          },
          enable: setting.enabled,
          properties: parsedProperties,
        };
      }),
    });

    this.sendPacket(packet);
  }

  public setStaffModsState(enabled: boolean, mods: StaffMod[]): void {
    const packet = new (enabled ? EnableStaffModsMessage : DisableStaffModsMessage)({
      staffMods: mods,
    });

    this.sendPacket(packet);
  }

  public glowPlayer(uuid: UUID, color: number): void {
    const packet = new OverrideGlowEffectMessage({
      playerUuid: getUUIDObject(uuid),
      color: new Color({ color }),
    });

    this.sendPacket(packet);
  }

  public removeGlow(uuid: UUID): void {
    const packet = new ResetGlowEffectMessage({
      playerUuid: getUUIDObject(uuid),
    });

    this.sendPacket(packet);
  }

  public removeAllGlow(): void {
    const packet = new ResetGlowEffectsMessage({});

    this.sendPacket(packet);
  }

  public showNotification(
    title: string,
    message: string,
    options: {
      durationMS?: number;
      resource?: Icon;
    }
  ): void {
    const icon = options.resource ? getIconObject(options.resource) : undefined;

    const packet = new DisplayNotificationMessage({
      titleAdventureJsonLines: adventureJSONText(title),
      descriptionAdventureJsonLines: adventureJSONText(message),
      displayTime: options.durationMS ? msToDuration(options.durationMS) : undefined,
      icon,
    });

    this.sendPacket(packet);
  }

  public addTeammate(member: TeamMember, send: boolean = true): void {
    this.teamMembers.set(member.uuid, member);

    if (send) this.sendTeammatesList();
  }

  public removeTeammate(member: UUID | TeamMember, send: boolean = true): void {
    if (member instanceof UUID) this.teamMembers.delete(member);
    else this.teamMembers.delete(member.uuid);

    if (send) this.sendTeammatesList();
  }

  public removeAllTeammates(send: boolean = true): void {
    this.teamMembers.clear();

    if (send) this.sendTeammatesList();
  }

  public sendTeammatesList(): void {
    const packet = new UpdateTeamMembersMessage({
      members: Array.from(this.teamMembers.values()).map(i => convertTeamMember(i)),
    });

    this.sendPacket(packet);
  }

  public overrideNametag(uuid: UUID, lines: string[]): void {
    const packet = new OverrideNametagMessage({
      playerUuid: getUUIDObject(uuid),
      adventureJsonLines: lines.map(l => adventureJSONText(l)),
    });

    this.sendPacket(packet);
  }

  public resetNametagOverride(uuid: UUID): void {
    const packet = new ResetNametagMessage({
      playerUuid: getUUIDObject(uuid),
    });

    this.sendPacket(packet);
  }

  public resetAllNametagOverrides(): void {
    const packet = new ResetNametagsMessage();

    this.sendPacket(packet);
  }

  public addWaypoint(waypoint: Waypoint) {
    const packet = new DisplayWaypointMessage({
      name: waypoint.name,
      location: new Location(waypoint.location),
      color: new Color({ color: waypoint.color }),
      preventRemoval: waypoint.preventRemoval ?? false,
      hidden: waypoint.hidden ?? false,
    });

    this.sendPacket(packet);
  }

  public removeWaypoint(waypoint: string | Waypoint) {
    const name = typeof waypoint === 'string' ? waypoint : waypoint.name;

    const packet = new RemoveWaypointMessage({
      name,
    });

    this.sendPacket(packet);
  }

  public removeAllWaypoints() {
    const packet = new ResetWaypointsMessage();

    this.sendPacket(packet);
  }

  public addCooldown(cooldown: Cooldown) {
    const packet = new DisplayCooldownMessage({
      name: cooldown.name,
      duration: cooldown.durationMS ? msToDuration(cooldown.durationMS) : undefined,
      icon: cooldown.icon ? getIconObject(cooldown.icon) : undefined,
    });

    this.sendPacket(packet);
  }

  public removeCooldown(cooldown: string | Cooldown) {
    const name = typeof cooldown === 'string' ? cooldown : cooldown.name;

    const packet = new RemoveCooldownMessage({
      name,
    });

    this.sendPacket(packet);
  }

  public removeAllCooldowns() {
    const packet = new ResetCooldownsMessage();

    this.sendPacket(packet);
  }
}

export interface PlayerOptions {
  handling: {
    registerPluginChannel: (channel: string) => void;
    sendPacket: (channel: string, bytes: Buffer) => boolean;
  };
  channelAlreadyRegistered?: boolean;
  pluginChannel?: ApolloPluginChannel;
}

export type PlayerEvents = {
  handshake: (data: PlayerHandshakeMessage) => void;
};
