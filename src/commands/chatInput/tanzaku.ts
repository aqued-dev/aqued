import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { infoEmbed } from '../../embeds/infosEmbed.js';
import { generateCustomId } from '../../utils/generateCustomId.js';

export default class Tanzaku implements ChatInputCommand {
	public command: SlashCommandOptionsOnlyBuilder;
	public settings: CommandSetting;
	public replaceList: Record<string, string>;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('tanzaku')
			.setDescription('短冊を生成します')
			.addStringOption((input) => input.setName('text').setDescription('短冊の内容').setRequired(true))
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
		this.replaceList = {
			'ｶﾞ': 'ガ',
			'ｷﾞ': 'ギ',
			'ｸﾞ': 'グ',
			'ｹﾞ': 'ゲ',
			'ｺﾞ': 'ゴ',
			'ｻﾞ': 'ザ',
			'ｼﾞ': 'ジ',
			'ｽﾞ': 'ズ',
			'ｾﾞ': 'ゼ',
			'ｿﾞ': 'ゾ',
			'ﾀﾞ': 'ダ',
			'ﾁﾞ': 'ヂ',
			'ﾂﾞ': 'ヅ',
			'ﾃﾞ': 'デ',
			'ﾄﾞ': 'ド',
			'ﾊﾞ': 'バ',
			'ﾋﾞ': 'ビ',
			'ﾌﾞ': 'ブ',
			'ﾍﾞ': 'ベ',
			'ﾎﾞ': 'ボ',
			'ﾊﾟ': 'パ',
			'ﾋﾟ': 'ピ',
			'ﾌﾟ': 'プ',
			'ﾍﾟ': 'ペ',
			'ﾎﾟ': 'ポ',
			'ｳﾞ': 'ヴ',
			'ﾜﾞ': 'ヷ',
			'ｦﾞ': 'ヺ',
			'ｱ': 'ア',
			'ｲ': 'イ',
			'ｳ': 'ウ',
			'ｴ': 'エ',
			'ｵ': 'オ',
			'ｶ': 'カ',
			'ｷ': 'キ',
			'ｸ': 'ク',
			'ｹ': 'ケ',
			'ｺ': 'コ',
			'ｻ': 'サ',
			'ｼ': 'シ',
			'ｽ': 'ス',
			'ｾ': 'セ',
			'ｿ': 'ソ',
			'ﾀ': 'タ',
			'ﾁ': 'チ',
			'ﾂ': 'ツ',
			'ﾃ': 'テ',
			'ﾄ': 'ト',
			'ﾅ': 'ナ',
			'ﾆ': 'ニ',
			'ﾇ': 'ヌ',
			'ﾈ': 'ネ',
			'ﾉ': 'ノ',
			'ﾊ': 'ハ',
			'ﾋ': 'ヒ',
			'ﾌ': 'フ',
			'ﾍ': 'ヘ',
			'ﾎ': 'ホ',
			'ﾏ': 'マ',
			'ﾐ': 'ミ',
			'ﾑ': 'ム',
			'ﾒ': 'メ',
			'ﾓ': 'モ',
			'ﾔ': 'ヤ',
			'ﾕ': 'ユ',
			'ﾖ': 'ヨ',
			'ﾗ': 'ラ',
			'ﾘ': 'リ',
			'ﾙ': 'ル',
			'ﾚ': 'レ',
			'ﾛ': 'ロ',
			'ﾜ': 'ワ',
			'ｦ': 'ヲ',
			'ﾝ': 'ン',
			'ｧ': 'ァ',
			'ｨ': 'ィ',
			'ｩ': 'ゥ',
			'ｪ': 'ェ',
			'ｫ': 'ォ',
			'ｯ': 'ッ',
			'ｬ': 'ャ',
			'ｭ': 'ュ',
			'ｮ': 'ョ',
			'｡': '。',
			'､': '、',
			'ｰ': 'ー',
			'｢': '「',
			'｣': '」',
			'･': '・'
		};
	}
	generate(text: string): string {
		let result: string = '';
		for (const [key, value] of Object.entries(this.replaceList)) {
			result = text.replaceAll(new RegExp(key, 'g'), value);
		}
		result = result.replaceAll(/[\dA-Za-z]/g, function (s) {
			return String.fromCodePoint((s.codePointAt(0) as number) + 0xfee0);
		});

		return `┏┷┓\n${[...result].map((text) => `┃${text}┃\n`).join('')}┗━☆彡`;
	}
	async run(interaction: ChatInputCommandInteraction) {
		const text = interaction.options.getString('text', true);
		const button = new ButtonBuilder()
			.setLabel('短冊を削除する')
			.setEmoji('🗑️')
			.setStyle(ButtonStyle.Danger)
			.setCustomId(generateCustomId('chatinput', 'button', 'tanzaku', 'delete', 'userid', interaction.user.id));
		await interaction.reply({
			embeds: [infoEmbed(this.generate(text), '🎋｜短冊')],
			components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)]
		});
	}
}
