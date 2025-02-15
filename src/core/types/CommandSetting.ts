import { ChannelType } from 'discord.js';
/**
 * コマンドの設定
 */
export interface CommandSetting {
	/**
	 * 必須権限(ユーザー側のみチェックします)
	 */
	userPermissions?: bigint[];
	/**
	 * 必須権限(実行時にBotと実行ユーザー側でチェックします)
	 */
	permissions?: bigint[];
	/**
	 * 管理者のみ
	 */
	adminOnly?: boolean;
	/**
	 * モデレーターのみ
	 */
	modOnly?: boolean;
	/**
	 * サーバー内のみ
	 */
	guildOnly?: boolean;
	/**
	 * 有効か
	 */
	enable?: boolean;
	/**
	 * 実行できるチャンネルのタイプ
	 */
	channelTypes?: ChannelType[];
}
