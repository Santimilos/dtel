import { MessageEmbedOptions } from "discord.js";
import config from "../../config/config";

export default {
	languages: ["en-**"],

	commands: {
		call: {
			pickup: "Pick up",
			hangup: "Hang up",
			dontTrustStrangers: "Don't trust files from strangers",

			errors: {
				unexpected: "We couldn't start that call. Try again later.",

				thisSideExpired: "Your number has expired. Get an admin to call `*233* and renew this number.",
				otherSideExpired: "The number you have attempted to call has expired.",

				numberInvalid: "The number you tried to call is invalid!",
				numberNotFound: "The number you tried to call doesn't exist!",
				numberMissingChannel: "We can't reach the other side. They probably removed our bot.",

				otherSideBlockedYou: "The other side has blocked you from calling them.",

				couldntReachOtherSide: "We couldn't send a message to the other side. This is due to an incorrect configuration on the other end.",
			},

			initiated: {
				title: "Dialing `{{ number }}`",
				description: "You can hang up at any time using `/hangup`, but be sure to give the other side time to pick up!",
				footer: {
					text: "ID: {{ callID }}",
				},
			},

			incomingCall: {
				title: "Incoming call",
				description: "There is an incoming call from `{{ number }}`. Pick up, hang up or wait it out.",
				footer: {
					text: "ID: {{ callID }}",
				},
			},

			pickedUp: {
				toSide: {
					title: "You picked up the call.",
					description: "You can now talk to the other side, put the call on hold `/hold` or hang up `/hangup`\nRemember to follow the [rules](https://dtel.austinhuang.me/en/latest/FAQ/#rules)",
					footer: {
						text: "ID: {{ callID }}",
					},
				},

				fromSide: {
					title: "The other side picked up!",
					description: "You can now talk to the other side, put the call on hold `/hold` or hang up `/hangup`.\n[rules](https://dtel.austinhuang.me/en/latest/FAQ/#rules)",
					footer: {
						text: "ID: {{ callID }}",
					},
				},
			},


			missedCall: {
				fromSide: {
					color: 0xFF0000,
					title: "Call expired",
					description: "The other side did not pick up (within 2 minutes)",
				},
				toSide: {
					color: 0xFF0000,
					title: "Call expired",
					description: "You missed the call (not answered within 2 minutes)",
				},
			},

			waitPrompt: {
				title: "The number you have dialed is busy",
				description: "Would you like to wait until the number is free? You can leave the queue at any time.",
			},

			// TODO: Maybe make these more generic? idk, yes/no buttons don't seem great
			waitAccept: "Yes",
			waitDeny: "No",
		},

		wizard: {
			errors: {
				channelHasNumber: "This channel already has a number! (`{{ number }}`). You can use `/call` to make a call.",
				unwhitelistedGuildHasNumber: "This server already has a number! (`{{ number }}`). Contact Customer Support at `*611` to request another number.",
				numberInUse: "That number is already in use. Try another.",
				numberInvalid: "Please enter a valid number.",
				numberBadFormat: "Please enter a number starting with",
			},

			modal: {
				title: "DTel Phone Number Registry",

				numberLabel: "Enter the number you would like to register:",
			},

			introEmbed: {
				title: "DTel Phone Number Registry",
				description: "📖 __**Read this before continuing:**__",
				fields: [{
					name: "🧹 This is a roleplaying bot!",
					value: "It cannot be used to call real phone numbers. All calls exist within Discord only.",
				}, {
					name: "💵 Payment",
					value: "Your number must be renewed for **500 credits** each month. To do so, call `*233*`.\nFind ways to get credits [here](https://dtel.austinhuang.me/en/latest/Payment/).\nDon't worry, the first month is **free**!",
				}, {
					name: "🏛️ The legal stuff",
					value: `Full documentation is located at ${config.siteLink}. \nIt contains important information such as our [Privacy Policy](https://dtel.austinhuang.me/en/latest/Privacy/).`,
				}],
			},

			successEmbed: {
				title: "✅ Good to go!",
				description: "Your number has been registered.",
				fields: [{
					name: "❓ Whats next?",
					value: "To learn more about the bot: `>help`, `>info`, `>links`.\nFor information about your number: call `*233`.\nFind other numbers to call at `*411`.",
				}, {
					name: "Number",
					value: "{{ number }}",
					inline: true,
				}, {
					name: "Expiry",
					value: "{{ expiry }}",
					inline: true,
				}],
			},
		},

		hangup: {
			baseEmbed: {
				color: 0xFF0000,
				title: "The call has ended!",
				footer: {
					text: "{{ callID }}",
				},
			},
			descriptions: {
				notPickedUp: {
					thisSide: "You have ended the call.",
					otherSide: "The other side ended the call.",
				},
				pickedUp: {
					thisSide: "You have ended the call after {{ time }}.",
					otherSide: "The other side ended the call after {{ time }}.",
				},
			},
		},

	},

	errors: {
		unexpected: "An unexpected error occurred.",
		notExecutableInCall: "This command can not be ran whilst in a call.",
		onlyExecutableInCall: "This command can only be ran whilst in a call.",
	},
};
