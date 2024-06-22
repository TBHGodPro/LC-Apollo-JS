import { UUID } from '@minecraft-js/uuid';
import { Location } from './packets/types';

export enum ApolloPluginChannel {
  DEFAULT = 'lunar:apollo',
}

export interface TeamMember {
  uuid: UUID;
  location?: Location;
  color?: number;
  displayName: string;
}

export interface Waypoint {
  name: string;
  location?: Location;
  color?: number;
  preventRemoval: boolean;
  hidden: boolean;
}

export interface Cooldown {
  name: string;
  durationMS?: number;
  icon?: Icon;
}

export type Icon =
  | {
      case: 'itemStack';
      value:
        | {
            value: number;
            case: 'itemId';
          }
        | {
            value: string;
            case: 'itemName';
          };
    }
  | {
      case: 'simpleResourceLocation';
      value: {
        resourceLocation: string;
        size: number;
      };
    }
  | {
      case: 'advancedResourceLocation';
      value: {
        resourceLocation: string;

        width: number;
        height: number;
        minU: number;

        maxU: number;
        minV: number;
        maxV: number;
      };
    };
