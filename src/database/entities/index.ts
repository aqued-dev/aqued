import { ChannelSetting } from './ChannelSetting.js';
import { Error } from './Error.js';
import { GlobalChatBan } from './GlobalChatBan.js';
import { GlobalChatMessage } from './GlobalChatMessage.js';
import { GuildSetting } from './GuildSetting.js';
import { UserSetting } from './UserSetting.js';

export const entities = [UserSetting, GuildSetting, ChannelSetting, GlobalChatMessage, GlobalChatBan, Error];
