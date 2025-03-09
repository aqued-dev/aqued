'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.InteractionContextType = exports.ApplicationIntegrationType = void 0;
var builders_1 = require('@discordjs/builders');
require('./userExtrans.js');
require('./interactionExtrans.js');
function setGuildOnly() {
	return this.setDMPermission(false);
}
var ApplicationIntegrationType;
(function (ApplicationIntegrationType) {
	ApplicationIntegrationType[(ApplicationIntegrationType['GuildInstall'] = 0)] = 'GuildInstall';
	ApplicationIntegrationType[(ApplicationIntegrationType['UserInstall'] = 1)] = 'UserInstall';
})(ApplicationIntegrationType || (exports.ApplicationIntegrationType = ApplicationIntegrationType = {}));
var InteractionContextType;
(function (InteractionContextType) {
	InteractionContextType[(InteractionContextType['Guild'] = 0)] = 'Guild';
	InteractionContextType[(InteractionContextType['BotDM'] = 1)] = 'BotDM';
	InteractionContextType[(InteractionContextType['PrivateChannel'] = 2)] = 'PrivateChannel';
})(InteractionContextType || (exports.InteractionContextType = InteractionContextType = {}));
builders_1.SlashCommandBuilder.prototype.setGuildOnly = setGuildOnly;
builders_1.ContextMenuCommandBuilder.prototype.setGuildOnly = setGuildOnly;
