import { EasyValue } from './packets/types';

export type ConfiguredSetting = (
  | {
      target: string;
      case: 'lunarClientMod' | 'mod';
    }
  | {
      target: ModuleTarget | string;
      case: 'apolloModule' | 'module';
    }
) & {
  enabled: boolean;
  properties?: { [key: string]: EasyValue };
};

export enum ModuleTarget {
  BEAM = 'beam',
  BORDER = 'border',
  CHAT = 'chat',
  COLORED_FIRE = 'colored_fire',
  COMBAT = 'combat',
  COOLDOWN = 'cooldown',
  ENTITY = 'entity',
  GLOW = 'glow',
  HOLOGRAM = 'hologram',
  LIMBS = 'limb',
  MOD_SETTINGS = 'mod_setting',
  NAMETAG = 'nametag',
  NICK_HIDER = 'nick_hider',
  NOTIFICATION = 'notification',
  ENRICHMENT = 'packet_enrichment',
  RICH_PRESENCE = 'rich_presence',
  SERVER_RULE = 'server_rule',
  STAFF_MOD = 'staff_mod',
  STOPWATCH = 'stopwatch',
  TEAM = 'team',
  TITLE = 'title',
  TNT_COUNTDOWN = 'tnt_countdown',
  TRANSFER = 'transfer',
  VIGNETTE = 'vignette',
  WAYPOINT = 'waypoint',
}
