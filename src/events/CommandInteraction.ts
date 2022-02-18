/* eslint-disable @typescript-eslint/no-var-requires */
import { CommandInteraction, Permissions } from "discord.js";
import config from "../config/config";
import Commands from "../config/commands";
import { PermissionLevel, CommandType } from "../interfaces/commandData";
import DTelClient from "../internals/client";
import Command from "../internals/commandProcessor";

interface Constructable<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new(...args: any) : T;
}

export default async(client: DTelClient, interaction: CommandInteraction): Promise<void> => {
	const winston = client.winston;
	const commandData = Commands.find(c => c.name === interaction.commandName);
	if (!commandData) {
		client.winston.error(`Cannot find command data for registered command ${interaction.commandName}`);
		interaction.reply(":x: Command not found within bot. Contact a maintainer");
		return;
	}

	// trailing slash is required
	let commandPath = `${__dirname}/../commands`;
	switch (commandData.useType) {
		case CommandType.standard: {
			commandPath += "/standard";
			break;
		}
		case CommandType.call: {
			commandPath += "/call";
			break;
		}
		case CommandType.customerSupport: {
			commandPath += "/support";
			break;
		}
		case CommandType.maintainer: {
			commandPath += "/maintainer";
			break;
		}
	}

	commandPath += `/${interaction.commandName}`;

	let commandFile: Constructable<Command>;
	try {
		if (config.devMode) {
			delete require.cache[require.resolve(commandPath)];
		}
		commandFile = require(commandPath).default;
		if (!commandFile) throw new Error();
	} catch {
		winston.error(`Cannot find command file for command ${interaction.commandName}`);
		interaction.reply(":x: Command not yet implemented in rewrite.");
		return;
	}

	const commandClass = new commandFile(client, interaction, commandData);
	try {
		switch (commandData.permissionLevel) {
			case PermissionLevel.owner: {
				if (!config.maintainers.includes(interaction.user.id)) return commandClass.notMaintainer();
				break;
			}
			case PermissionLevel.customerSupport: {
				// TODO: Handle customer support stuff
				break;
			}
			case PermissionLevel.serverAdmin: {
				if (!(interaction.member.permissions as Permissions).has(Permissions.FLAGS.MANAGE_GUILD)) return commandClass.permCheckFail();
				break;
			}
		}

		winston.info(`Running command ${interaction.commandName}`);
		commandClass._run();
	} catch (e) {
		winston.error(`Error occurred whilst executing command ${interaction.commandName}`, e);
		interaction.reply(":x: An error occurred whilst executing this command.");
	}
};
