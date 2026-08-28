import { PermissionFlags, PermissionFlagsBits } from 'discord.js';

export const translatePermission = (flags: Array<PermissionFlags | bigint | string> | bigint): string[] => {
	const permissionNames: { [key in keyof typeof PermissionFlagsBits]: string } = {
		CreateInstantInvite: '招待を作成',
		KickMembers: 'メンバーをキック',
		BanMembers: 'メンバーをBan',
		Administrator: '管理者',
		ManageChannels: 'チャンネルの管理',
		ManageGuild: 'サーバー管理',
		AddReactions: 'リアクションの追加',
		ViewAuditLog: '監査ログを表示',
		PrioritySpeaker: '優先スピーカー',
		Stream: 'WEB カメラ',
		ViewChannel: 'チャンネルを見る',
		SendMessages: 'メッセージを送信',
		SendTTSMessages: 'テキスト読み上げメッセージを送信する',
		ManageMessages: 'メッセージの管理',
		EmbedLinks: '埋め込みリンク',
		AttachFiles: 'ファイルを添付',
		ReadMessageHistory: 'メッセージ履歴を読む',
		MentionEveryone: '@everyone、@here、全てのロールにメンション',
		UseExternalEmojis: '外部の絵文字を使用する',
		ViewGuildInsights: 'サーバーインサイトを見る',
		Connect: '接続',
		Speak: '発言',
		MuteMembers: 'メンバーをミュート',
		DeafenMembers: 'メンバーのスピーカーをミュート',
		MoveMembers: 'メンバーを移動',
		UseVAD: 'ユーザーアクティビティ',
		ChangeNickname: 'ニックネームの変更',
		ManageNicknames: 'ニックネームの管理',
		ManageRoles: 'ロールの管理',
		ManageWebhooks: 'ウェブフックの管理',
		ManageGuildExpressions: '絵文字の管理',
		UseApplicationCommands: 'アプリコマンドを使う',
		RequestToSpeak: 'スピーカー参加をリクエスト',
		ManageEvents: 'イベントの管理',
		ManageThreads: 'スレッドの管理',
		CreatePublicThreads: '公開スレッドの作成',
		CreatePrivateThreads: 'プライベートスレッドの作成',
		UseExternalStickers: '外部のスタンプを使用する',
		SendMessagesInThreads: 'スレッドでメッセージを送信',
		UseEmbeddedActivities: 'ユーザーアクティビティ',
		ModerateMembers: 'メンバーをタイムアウト',
		ViewCreatorMonetizationAnalytics: 'ロールサブスクリプションのインサイトを見る',
		UseSoundboard: 'サウンドボードを使用',
		CreateGuildExpressions: 'エクスプレッションを作成',
		CreateEvents: 'イベントを作成',
		UseExternalSounds: '外部のサウンドの使用',
		SendVoiceMessages: 'ボイスメッセージを送信',
		SendPolls: '投票を作成',
		UseExternalApps: '外部のアプリを使用',
		PinMessages: 'メッセージをピン留め',
		BypassSlowmode: '低速モードを回避',
		SetVoiceChannelStatus: 'ボイスチャンネルステータスを設定',
		/**
		 * @deprecated
		 */
		ManageEmojisAndStickers: '絵文字の管理',
	};

	const grantedPermissions: Set<string> = new Set();

	const permissionFlags = typeof flags === 'bigint' ? [flags] : flags;

	permissionFlags.forEach((flag) => {
		if (typeof flag === 'bigint') {
			for (const [key, value] of Object.entries(PermissionFlagsBits) as [keyof typeof PermissionFlagsBits, bigint][]) {
				if ((flag & value) === value) {
					grantedPermissions.add(permissionNames[key] || '不明な権限');
				}
			}
		} else if (typeof flag === 'string' && permissionNames[flag as keyof typeof PermissionFlagsBits]) {
			grantedPermissions.add(permissionNames[flag as keyof typeof PermissionFlagsBits]);
		}
	});
	console.log(Array.from(grantedPermissions));
	return grantedPermissions.size > 0 ? Array.from(grantedPermissions) : ['不明な権限'];
};
