import { SlashCommandClass } from '../../lib/bot/index.js';
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { DOMParser } from '@xmldom/xmldom';
export default class implements SlashCommandClass {
	command = new SlashCommandBuilder()
		.setName('weather')
		.setDescription('天気を表示します')
		// eslint-disable-next-line unicorn/consistent-function-scoping
		.addStringOption((input) => input.setName('place').setDescription('場所').setAutocomplete(true).setRequired(true));
	async run(interaction: ChatInputCommandInteraction) {
		await interaction.reply({ content: `Place Id: ${interaction.options.getString("place")}.`, ephemeral: true });
	}
	async autoComplete(interaction: AutocompleteInteraction) {
		if (interaction.commandName !== this.command.name) return;
		let areaXml: string = interaction.client.cache.get('primary_area.xml');
		if (!areaXml) {
			const response = await fetch('https://weather.tsukumijima.net/primary_area.xml');
			const text = await response.text();
			interaction.client.cache.set('primary_area.xml', text);
			areaXml = text;
		}
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(areaXml, 'text/xml');
		// eslint-disable-next-line unicorn/prefer-query-selector
		const cityTags = xmlDoc.getElementsByTagName('city');
		const data: { title: string; id: string }[] = [];
		// eslint-disable-next-line unicorn/no-for-loop
		for (let i = 0; i < cityTags.length; i++) {
			const cityTag = cityTags[i];
			data.push({ title: cityTag.getAttribute('title'), id: cityTag.getAttribute('id') });
		}
		const focusedValue = interaction.options.getFocused();

		await interaction.respond(
			data
				.filter((choice) => choice.title.includes(focusedValue))
				.slice(0, 25)
				.map((choice) => ({ name: choice.title, value: choice.id })),
		);
	}
}
