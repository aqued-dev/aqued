import { ChannelType } from 'discord.js';
/**
 * コマンドの設定
 */
export interface CommandSetting {
	/**
	 * 実行前に評価する関数
	 */
	check?: () => boolean;
	/**
	 * 必須権限(実行時にもチェックします)
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
	/**
	 * クールダウン
	 */
	cooldown?: number;
	/**
	 * クールダウンの対象
	 */
	cooldownTargets?: 'guild' | 'user' | 'channel' | 'bot';
	/**
	 * クールダウンになるまでの回数
	 */
	cooldownLimit?: number;
}
