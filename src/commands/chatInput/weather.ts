import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed, successEmbed } from '../../embeds/infosEmbed.js';
interface WeatherData {
	error?: string;
	publicTime: string;
	publicTimeFormatted: string;
	publishingOffice: string;
	title: string;
	link: string;
	description: {
		publicTime: string;
		publicTimeFormatted: string;
		headlineText: string;
		bodyText: string;
		text: string;
	};
	forecasts: {
		date: string;
		dateLabel: string;
		telop: string;
		detail: { weather: string | null; wind: string | null; wave: string | null };
		temperature: {
			max: { celsius: string | null; fahrenheit: string | null };
			min: { celsius: string | null; fahrenheit: string | null };
		};
		chanceOfRain: { T00_06: string; T06_12: string; T12_18: string; T18_24: string };
		image: { title: string; url: string; width: number; height: number };
	}[];
	location: { area: string; prefecture: string; district: string; city: string };
	copyright: {
		title: string;
		link: string;
		image: {
			title: string;
			link: string;
			url: string;
			width: number;
			height: number;
		};
		provider: {
			link: string;
			name: string;
			note: string;
		}[];
	};
}
export default class Weather implements ChatInputCommand {
	public command: SlashCommandOptionsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('weather')
			.setDescription('天気を表示します')
			.addStringOption((option) =>
				option.setName('place').setDescription('場所').setRequired(true).setAutocomplete(true)
			)
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const response = await fetch(
			`https://weather.tsukumijima.net/api/forecast/city/${interaction.options.getString('place')}`
		);
		const data = (await response.json()) as WeatherData;
		if (data.error) {
			return await interaction.editReply({ embeds: [failEmbed('取得時にエラーが発生しました', 'データエラー')] });
		}
		if (!response.ok) {
			return await interaction.editReply({ embeds: [failEmbed('取得時にエラーが発生しました', 'サーバーエラー')] });
		}
		const today = data.forecasts[0];
		const day2 = data.forecasts[1];
		const day3 = data.forecasts[2];
		if (!today || !day2 || !day3) {
			return await interaction.editReply({ embeds: [failEmbed('取得時にエラーが発生しました', '読み込みエラー')] });
		}

		return await interaction.editReply({
			embeds: [
				successEmbed(
					data.description.bodyText.replaceAll('　', '').replaceAll('\n\n', '\n'),
					undefined,
					`${today.dateLabel} の ${data.title}`,
					`発表日時: ${data.publicTimeFormatted} / API By ${data.copyright.title}`
				).addFields(
					{ name: '天気', value: `${today.telop}(${today.detail.weather})` },
					{ name: '風', value: `${today.detail.wind ?? '--'}` },
					{ name: '波', value: `${today.detail.wave ?? '--'}` },
					{
						name: '気温',
						value: `最低: ${today.temperature.min.celsius ?? '--'} °C, 最高: ${today.temperature.max.celsius ?? '--'} °C`
					},
					{
						name: '降水確率',
						value: `0-6時: ${today.chanceOfRain.T00_06}, 6-12時: ${today.chanceOfRain.T06_12}, 12-18時: ${today.chanceOfRain.T12_18}, 18-24時: ${today.chanceOfRain.T18_24}`
					}
				),
				successEmbed(
					undefined,
					undefined,
					`${day2.dateLabel} の ${data.title}`,
					`発表日時: ${data.publicTimeFormatted} / API By ${data.copyright.title}`
				).addFields(
					{ name: '天気', value: `${day2.telop}(${day2.detail.weather})` },
					{ name: '風', value: `${day2.detail.wind ?? '--'}` },
					{ name: '波', value: `${day2.detail.wave ?? '--'}` },
					{
						name: '気温',
						value: `最低: ${day2.temperature.min.celsius ?? '--'} °C, 最高: ${day2.temperature.max.celsius ?? '--'} °C`
					},
					{
						name: '降水確率',
						value: `0-6時: ${day2.chanceOfRain.T00_06}, 6-12時: ${day2.chanceOfRain.T06_12}, 12-18時: ${day2.chanceOfRain.T12_18}, 18-24時: ${day2.chanceOfRain.T18_24}`
					}
				),
				successEmbed(
					undefined,
					undefined,
					`${day3.dateLabel} の ${data.title}`,
					`発表日時: ${data.publicTimeFormatted} / API By ${data.copyright.title}`
				).addFields(
					{ name: '天気', value: `${day3.telop}(${day3.detail.weather})` },
					{ name: '風', value: `${day3.detail.wind ?? '--'}` },
					{ name: '波', value: `${day3.detail.wave ?? '--'}` },
					{
						name: '気温',
						value: `最低: ${day3.temperature.min.celsius ?? '--'} °C, 最高: ${day3.temperature.max.celsius ?? '--'} °C`
					},
					{
						name: '降水確率',
						value: `0-6時: ${day3.chanceOfRain.T00_06}, 6-12時: ${day3.chanceOfRain.T06_12}, 12-18時: ${day3.chanceOfRain.T12_18}, 18-24時: ${day3.chanceOfRain.T18_24}`
					}
				)
			]
		});
	}
}
