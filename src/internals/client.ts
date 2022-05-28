import { Client, ClientOptions, Message, MessageEmbedOptions, MessageOptions, Serialized, ShardClientUtil, Snowflake, TextBasedChannel, TextChannel } from "discord.js";
import { REST } from "@discordjs/rest";
import config from "../config/config";
import CallClient from "./callClient";
import { APITextChannel, APIGuildMember } from "discord-api-types/v10";
import { PermissionLevel } from "../interfaces/commandData";
import { winston } from "../dtel";
import { Logger } from "winston";
import { db } from "../database/db";

class DTelClient extends Client {
	config = config;
	restAPI: REST;

	db = db;
	winston: Logger = winston;

	calls: CallClient[] = [];

	constructor(options: ClientOptions) {
		super(options);

		this.restAPI = new REST();
		this.restAPI.setToken(this.token || "");
	}

	errorEmbed(description: string, options?: MessageEmbedOptions): MessageEmbedOptions {
		return {
			color: config.colors.error,
			title: "❌ Error!",
			description,
			...options,
		};
	}

	warningEmbed(description: string, options?: MessageEmbedOptions): MessageEmbedOptions {
		return {
			color: 0xFFFF00,
			description,
			...options,
		};
	}

	// TODO: Convert to re2 somehow
	parseNumber(input: string): string {
		return input.replace(/(a|b|c)/ig, "2")
			.replace(/(d|e|f)/ig, "3")
			.replace(/(g|h|i)/ig, "4")
			.replace(/(j|k|l)/ig, "5")
			.replace(/(m|n|o)/ig, "6")
			.replace(/(p|q|r|s)/ig, "7")
			.replace(/(t|u|v)/ig, "8")
			.replace(/(w|x|y|z)/ig, "9")
			.replace(/-/ig, "")
			.replace(/("("|")")/ig, "")
			.replace(/\s+/g, "");
	}

	async sendCrossShard(options: MessageOptions, channelID: Snowflake | string): Promise<string|null> {
		let ch: TextChannel, m: Message;
		try {
			ch = await this.channels.fetch(channelID) as TextChannel;
			m = await ch.send(options);
			return m.id;
		} catch {
			const shardID = await this.shardIdForChannelId(channelID);
			if (!shardID) throw new Error("channelNotFound");

			let result: string | null | undefined;
			try {
				type ctx = { channelID: string; messageOptions: MessageOptions; };
				result = await this.shard?.broadcastEval<string | null, ctx>(async(client: Client, context) => {
					try {
						const channel = await client.channels.fetch(context.channelID) as TextBasedChannel;
						const msg = await channel.send(context.messageOptions as MessageOptions);
						return msg.id;
					} catch (e) {
						return null;
					}
				}, {
					context: {
						channelID,
						messageOptions: options,
					},
					shard: shardID,
				});
			} catch {
				throw new Error("crossShardPermsFail");
			}

			return result as string; // We know it exists as we checked for shard ID earlier
		}
	}

	async shardIdForChannelId(id: string): Promise<number> {
		if (!process.env.SHARD_COUNT || Number(process.env.SHARD_COUNT) == 1) return 0;
		const channelObject = await this.restAPI.get(`/channels/${id}`) as APITextChannel;

		return ShardClientUtil.shardIdForGuildId(channelObject.guild_id as string, Number(process.env.SHARD_COUNT));
	}

	async getPerms(userID: string): Promise<Omit<PermissionLevel, "serverAdmin">> {
		// We don't deal with serverAdmin here
		if (config.maintainers.includes(userID)) return PermissionLevel.maintainer;

		let memberInSupportServer: APIGuildMember;
		try {
			memberInSupportServer = await this.restAPI.get(`/guilds/${config.supportGuild.id}/members/${userID}`) as APIGuildMember;
		} catch {
			return PermissionLevel.none;
		}

		const roles = memberInSupportServer.roles;

		if (roles.includes(config.supportGuild.roles.boss)) return PermissionLevel.maintainer;
		else if (roles.includes(config.supportGuild.roles.customerSupport)) return PermissionLevel.customerSupport;
		else if (roles.includes(config.supportGuild.roles.contributor)) return PermissionLevel.contributor;
		else if (roles.includes(config.supportGuild.roles.donator)) return PermissionLevel.donator;

		return PermissionLevel.none;
	}
}

export default DTelClient;
