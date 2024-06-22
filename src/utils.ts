import { Duration, ListValue, NullValue, Struct, Value } from '@bufbuild/protobuf';
import { EasyValue } from './packets/types';
import { UUID, parseUUID } from '@minecraft-js/uuid';
import { Uuid, TeamMember as TeamMemberObject, Location, Color, Icon as IconObject, ItemStackIcon, SimpleResourceLocationIcon, AdvancedResourceLocationIcon } from './packets/extra';
import { Icon, TeamMember } from './constants';

export function parseValue(value: EasyValue): Value {
  if (value === null)
    return new Value({
      kind: {
        case: 'nullValue',
        value: NullValue.NULL_VALUE,
      },
    });

  if (typeof value === 'number' && !isNaN(value))
    return new Value({
      kind: {
        case: 'numberValue',
        value,
      },
    });

  if (typeof value === 'string')
    return new Value({
      kind: {
        case: 'stringValue',
        value,
      },
    });

  if (value === true || value === false)
    return new Value({
      kind: {
        case: 'boolValue',
        value,
      },
    });

  if (Array.isArray(value))
    return new Value({
      kind: {
        case: 'listValue',
        value: new ListValue({
          values: value.map(i => parseValue(i)),
        }),
      },
    });

  if (typeof value === 'object') {
    const object = {} as {
      [key: string]: Value;
    };

    for (const key in value) {
      object[key] = parseValue(value[key]);
    }

    return new Value({
      kind: {
        case: 'structValue',
        value: new Struct({
          fields: object,
        }),
      },
    });
  }

  return new Value({
    kind: {
      case: undefined,
    },
  });
}

export function bufferToBigInt(buffer: Buffer): bigint {
  // Convert the buffer to a hexadecimal string
  let hexString = '0x';

  buffer.forEach(byte => {
    hexString += byte.toString(16).padStart(2, '0');
  });

  // Convert the hexadecimal string to a bigint
  return BigInt(hexString);
}

export function getUUIDObject(uuid: UUID | string): Uuid {
  if (!(uuid instanceof UUID)) uuid = parseUUID(uuid.toString());
  return new Uuid({
    high64: bufferToBigInt(uuid.getMostSignificantBits()),
    low64: bufferToBigInt(uuid.getLeastSignificantBits()),
  });
}

export function msToDuration(ms: number): Duration {
  const seconds = Math.floor(ms / 1000);
  const nanos = (ms - seconds * 1000) * 1000000;

  return new Duration({
    seconds: BigInt(seconds),
    nanos,
  });
}

export function convertTeamMember(member: TeamMember): TeamMemberObject {
  return new TeamMemberObject({
    playerUuid: getUUIDObject(member.uuid),
    location: new Location(member.location),
    markerColor: new Color({ color: member.color ?? 0x0088dd }),
    adventureJsonPlayerName: adventureJSONText(member.displayName),
  });
}

export function adventureJSONText(text: string) {
  return `{"text": "${text}"}`;
}

export function getIconObject(icon: Icon): IconObject {
  let value;
  switch (icon.case) {
    case 'itemStack':
      value = new ItemStackIcon({
        item: icon.value,
      });
      break;

    case 'simpleResourceLocation':
      value = new SimpleResourceLocationIcon(icon.value);
      break;

    case 'advancedResourceLocation':
      value = new AdvancedResourceLocationIcon(icon.value);
      break;
  }

  return new IconObject({
    contents: {
      case: icon.case,
      value,
    } as any,
  });
}
