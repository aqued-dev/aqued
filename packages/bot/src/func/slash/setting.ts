import { SlashCommandClass } from '../../lib/bot/index.js';
import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	BaseMessageOptions,
	MessagePayload,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
	ButtonBuilder,
	ButtonStyle,
	ButtonInteraction,
} from 'discord.js';
import { Ai } from '../../lib/db/entities/Ai.js';
import { dataSource } from '../../lib/db/dataSource.js';
import { EarthQuakeAlert } from '../../lib/db/entities/EarthQuakeAlert.js';

export default class AutoPublish implements SlashCommandClass {
	command = new SlashCommandBuilder()
		.setName('setting')
		.setDescription('Aquedの設定をします。')
		.addSubcommand((input) =>
			input
				.setName('channel')
				.setDescription('Aquedのチャンネル系機能設定コマンドです。')
				.addChannelOption((input) =>
					input.setName('チャンネル').setDescription('設定するチャンネル').setRequired(true),
				),
		)
		.setDMPermission(false);
	channelId: string;
	makeMessage(first: boolean, bool?: boolean, content?: string): MessagePayload | BaseMessageOptions {
		const func = new StringSelectMenuBuilder()
			.setPlaceholder('機能を選択')
			.setCustomId('setting_select_name')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('ai')
					.setDescription('Gemini AIを有効・無効化します')
					.setValue('ai'),
				new StringSelectMenuOptionBuilder()
					.setLabel('earthquake')
					.setDescription('地震速報を有効・無効にします')
					.setValue('earthquake'),
			)
			.setMaxValues(1);
		const boolButton = new ButtonBuilder();
		if (!bool) boolButton.setLabel('有効にする').setCustomId('setting_button_false').setStyle(ButtonStyle.Success);
		else boolButton.setLabel('無効にする').setCustomId('setting_button_true').setStyle(ButtonStyle.Danger);
		const components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] = [
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(func),
		];
		if (!first) components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(boolButton));
		return { content: content || '', components };
	}
	async run(interaction: ChatInputCommandInteraction) {
		if (interaction.options.getSubcommand() !== 'channel') return;
		const channel = interaction.options.getChannel('チャンネル');
		this.channelId = channel.id;
		await interaction.reply(this.makeMessage(true, false, '設定する項目をお選びください'));
	}
	async button(interaction: ButtonInteraction) {
		if (interaction.customId === 'setting_button_false' || interaction.customId === 'setting_button_true') {
			if (!this.channelId)
				return await interaction.update({ content: '設定パネルの使用期限が切れています', components: [] });
			if (interaction.message.content.includes('AI')) {
				const bool = await this.aiRegister();
				return await this.response('AI', bool, interaction);
			} else if (interaction.message.content.includes('地震速報')) {
				const bool = await this.eqRegister();
				await this.response('地震速報', bool, interaction);
			}
		}
	}
	async select(interaction: StringSelectMenuInteraction) {
		const value = interaction.values[0];
		if (interaction.customId === 'setting_select_name') {
			switch (value) {
				case 'ai': {
					if (!this.channelId)
						return await interaction.update({ content: '設定パネルの使用期限が切れています', components: [] });
					const { bool } = await this.aiRegistered();
					await interaction.update(this.makeMessage(false, bool, bool ? '**AI: __登録__**' : '**AI: __未登録__**'));

					break;
				}
				case 'earthquake': {
					if (!this.channelId)
						return await interaction.update({ content: '設定パネルの使用期限が切れています', components: [] });
					const { bool } = await this.eqRegistered();
					await interaction.update(
						this.makeMessage(false, bool, bool ? '**地震速報: __登録__**' : '**地震速報: __未登録__**'),
					);

					break;
				}

				default:
					break;
			}
		}
	}
	async response(name: string, registered: boolean, interaction: ButtonInteraction) {
		await interaction.update(
			this.makeMessage(false, registered, registered ? `**${name}: __登録__**` : `**${name}: __未登録__**`),
		);
		await interaction.followUp({
			content: `${name}を<#${this.channelId}>で${registered ? '登録' : '解除'}しました`,
			ephemeral: true,
		});
	}

	private async aiRegistered(): Promise<{ bool: boolean; data: Ai | undefined }> {
		return dataSource.transaction(async (em) => {
			const channelId = this.channelId;
			const repo = em.getRepository(Ai);
			const data = await repo.findOneBy({ channelId });

			if (!data) return { bool: false, data: undefined };
			return { bool: true, data };
		});
	}
	private async aiRegister() {
		return dataSource.transaction(async (em) => {
			const registered = await this.aiRegistered();
			const repo = em.getRepository(Ai);
			if (registered.bool) {
				repo.delete(registered.data);
				return false;
			} else {
				const data = new Ai();
				data.channelId = this.channelId;
				repo.save(data);
				return true;
			}
		});
	}
	private async eqRegistered(): Promise<{ bool: boolean; data: EarthQuakeAlert | undefined }> {
		return dataSource.transaction(async (em) => {
			const channelId = this.channelId;
			const repo = em.getRepository(EarthQuakeAlert);
			const data = await repo.findOneBy({ channelId });

			if (!data) return { bool: false, data: undefined };
			return { bool: true, data };
		});
	}
	private async eqRegister() {
		return dataSource.transaction(async (em) => {
			const registered = await this.eqRegistered();
			const repo = em.getRepository(EarthQuakeAlert);
			if (registered.bool) {
				repo.delete(registered.data);
				return false;
			} else {
				const data = new EarthQuakeAlert();
				data.channelId = this.channelId;
				repo.save(data);
				return true;
			}
		});
	}
}
