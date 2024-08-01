import { BaseInteraction, ChannelType, Client, Colors, EmbedBuilder, SnowflakeUtil } from 'discord.js';
import { InteractionEventClass } from '../../lib/index.js';
import { userFormat } from '../../lib/template/format.js';

export default class implements InteractionEventClass {
	async run(interaction: BaseInteraction, client: Client) {
		if (interaction.isChatInputCommand()) {
			const command = client.loads.slash.get(interaction.commandName);
			if (!command) {
				await interaction.reply({
					embeds: [new EmbedBuilder().setTitle('コマンドが見つかりません').setDescription('no').setColor(Colors.Blue)],
				});
				return;
			}

			command.run(interaction).catch(async (error) => {
				const Snowflake = SnowflakeUtil;
				let id: bigint | string = Snowflake.generate();

				const errorChannel = client.channels.cache.get('1121747218328715274');

				if (!errorChannel) id = 'なし';
				if (errorChannel.isThread() && errorChannel.parent.type === ChannelType.GuildForum) {
					const message = await errorChannel.send({
						embeds: [
							new EmbedBuilder()
								.setAuthor({
									name: 'エラーが発生しました',
									iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/no.png',
								})

								.setFooter({ text: `エラーid: ${id}` })
								.setColor(Colors.Red)
								.addFields({ name: 'コマンド', value: `${interaction.commandName}(${interaction.commandId})` })
								.addFields({ name: 'ギルド', value: `${interaction.guild.name}(${interaction.guildId})` })
								.addFields({
									name: 'ユーザー',
									value: userFormat(interaction.user),
								})
								.addFields({ name: 'パーミッション', value: `${interaction.guild.members.me.permissions.bitfield}` })
								.setColor(Colors.Blue),
						],
					});
					message.reply('```js\n' + error + '\n```');
				}
				client.logger.error(`Error id: ${id}`);
				client.logger.error(error);

				const embed = new EmbedBuilder()
					.setAuthor({
						name: 'エラーが発生しました',
						iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/no.png',
					})
					.setDescription(
						`申し訳ございません。\nお手数をおかけしますが、サポートサーバーでお問い合わせください。\nお問い合わせの際は、エラーidをお伝えください。`,
					)
					.setFooter({ text: `エラーid: ${id}` })
					.setColor(Colors.Red);
				if (interaction.deferred)
					return await interaction.editReply({
						embeds: [embed],
					});
				if (interaction.replied)
					return await interaction.followUp({
						embeds: [embed],
					});
				return await interaction.reply({
					embeds: [embed],
				});
			});
		} else {
			await Promise.all(
				[...client.loads.slash.values()].map(async (value) => {
					if (value.button && interaction.isButton()) await value.button(interaction);
					if (value.modal && interaction.isModalSubmit()) await value.modal(interaction);
					if (value.select && interaction.isAnySelectMenu()) await value.select(interaction);

					if (value.autoComplete && interaction.isAutocomplete() && interaction.commandName === value.command.name)
						await value.autoComplete(interaction);
				}),
			);
		}
	}
}
