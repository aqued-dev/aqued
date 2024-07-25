import { SlashCommandClass } from '../../lib/bot/index.js';
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { dataSource } from '../../lib/db/dataSource.js';
import { EarthQuakeAlert } from '../../lib/db/entities/EarthQuakeAlert.js';

export default class EarthQuake implements SlashCommandClass {
	command = new SlashCommandBuilder()
		.setName('earthquake')
		.setDescription('地震系コマンド')
		.addSubcommand((input) =>
			input
				.setName('alert')
				.setDescription('地震速報を有効・無効にします')
				.addChannelOption((input) =>
					input.setName('受信するチャンネル').setDescription('地震速報を受信するチャンネルを選択してください'),
				),
		);
	private interaction: ChatInputCommandInteraction;
	private getChannelId() {
		const channel = this.interaction.options.getChannel('受信するチャンネル');
		if (!channel) return this.interaction.channelId;
		return channel.id;
	}
	private async getData() {
		return dataSource.transaction(async (em) => {
			const channelId = this.getChannelId();
			const repo = em.getRepository(EarthQuakeAlert);
			const data = await repo.findOneBy({ channelId });
			return data;
		});
	}
	private async registered(): Promise<{ bool: boolean; data: EarthQuakeAlert | undefined }> {
		const data = await this.getData();
		if (!data) return { bool: false, data: undefined };
		return { bool: true, data };
	}
	private async register() {
		return dataSource.transaction(async (em) => {
			const registered = await this.registered();
			const repo = em.getRepository(EarthQuakeAlert);
			if (registered.bool) {
				repo.remove(registered.data);
				return false;
			} else {
				const data = new EarthQuakeAlert();
				data.channelId = this.getChannelId();
				repo.insert(data);
				return true;
			}
		});
	}
	async run(interaction: ChatInputCommandInteraction) {
		this.interaction = interaction;
		if (interaction.options.getSubcommand() === 'alert') {
			const register = await this.register();
			if (register) {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setAuthor({
								name: '登録しました',
								iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
							})
							.setColor(Colors.Blue),
					],
				});
			} else {
				await interaction.reply({
					embeds: [
						new EmbedBuilder().setColor(Colors.Blue).setAuthor({
							name: '登録解除しました',
							iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
						}),
					],
				});
			}
		}
	}
}
