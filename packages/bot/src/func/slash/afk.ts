import { SlashCommandClass } from '../../lib/bot/index.js';
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { AFK } from '../../lib/db/entities/AFK.js';
import { dataSource } from '../../lib/db/dataSource.js';

export default class AFKCI implements SlashCommandClass {
	command = new SlashCommandBuilder()
		.setName('afk')
		.setDescription('AFKを有効・無効化します')
		.addStringOption((input) => input.setName('reason').setDescription('理由').setRequired(false));
	private interaction: ChatInputCommandInteraction;
	private async getData() {
		return dataSource.transaction(async (em) => {
			const userId = this.interaction.user.id;
			const repo = em.getRepository(AFK);
			const data = await repo.findOneBy({ userId });
			return data;
		});
	}
	private async registered(): Promise<{ bool: boolean; data: AFK | undefined }> {
		const data = await this.getData();
		if (!data) return { bool: false, data: undefined };
		return { bool: true, data };
	}
	private async register() {
		return dataSource.transaction(async (em) => {
			const registered = await this.registered();
			const repo = em.getRepository(AFK);
			if (registered.bool) {
				repo.remove(registered.data);
				return false;
			} else {
				const reason = this.interaction.options.getString('reason');
				const data = new AFK();
				data.userId = this.interaction.user.id;
				if (reason) data.reason = reason;
				repo.insert(data);
				return true;
			}
		});
	}
	async run(interaction: ChatInputCommandInteraction) {
		this.interaction = interaction;
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
						name: '解除しました',
						iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
					}),
				],
			});
		}
	}
}
