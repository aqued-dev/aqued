import { ActionRowBuilder, BaseInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isButton()) {
		return;
	}
	switch (interaction.customId) {
		case 'verify_button_1': {
			const number0 = Math.floor(Math.random() * 901),
				number1 = Math.floor(Math.random() * 10);
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(`verifyModal_${number0 + number1}`)
					.setTitle('足し算認証')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel(`${number0} + ${number1}の答え`)
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('ここに入力して下さい。')
								.setRequired(true)
								.setCustomId('answer'),
						),
					),
			);
			break;
		}
		case 'verify_button_2': {
			const number0 = Math.floor(Math.random() * 901),
				number1 = Math.floor(Math.random() * 10);
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(`verifyModal_${number0 - number1}`)
					.setTitle('引き算認証')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel(`${number0} - ${number1}の答え`)
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('ここに入力して下さい。')
								.setRequired(true)
								.setCustomId('answer'),
						),
					),
			);
			break;
		}
		case 'verify_button_3': {
			const number0 = Math.floor(Math.random() * 901),
				number1 = Math.floor(Math.random() * 10);
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(`verifyModal_${number0 * number1}`)
					.setTitle('掛け算認証')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel(`${number0} × ${number1}の答え(小数点以下削除)`)
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('ここに入力して下さい。')
								.setRequired(true)
								.setCustomId('answer'),
						),
					),
			);
			break;
		}
		case 'verify_button_4': {
			const number0 = Math.floor(Math.random() * 901),
				number1 = Math.floor(Math.random() * 10);
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(`verifyModal_${Math.trunc(number0 / number1)}`)
					.setTitle('割り算認証')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel(`${number0} ÷ ${number1}の答え(小数点以下削除)`)
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('ここに入力して下さい。')
								.setRequired(true)
								.setCustomId('answer'),
						),
					),
			);
			break;
		}
		case 'verify_button_5': {
			const role = await interaction.client.botData.verifyPanel.get(interaction.message.id);
			await interaction.guild.members.resolve(interaction.user).roles.add(role);
			await interaction.ok('認証に成功', '認証に成功しました！', true);
			break;
		}
		case 'verify_button_6': {
			const number0 = Math.floor(Math.random() * 901);
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(`verifyModal_${number0}`)
					.setTitle('割り算認証')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel(`${number0}を入力してください。`)
								.setStyle(TextInputStyle.Short)
								.setPlaceholder('ここに入力して下さい。')
								.setRequired(true)
								.setCustomId('answer'),
						),
					),
			);
			break;
		}
	}
}
