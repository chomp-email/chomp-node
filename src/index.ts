import { sleep } from "./functions.js";
import { RawEmail } from "./interfaces/email.interface";
import { InitOptions } from "./interfaces/init-options.interface";
import { WaitForOptions } from "./interfaces/wait-for-options.interface";
import { createRequire } from "node:module";
import { Email } from "./classes/email.class.js";

export default class Chomp {
	private baseUri = "https://api.chomp.email";
	private apiKey: string;
	private defaultTimeoutSeconds: number = 180;
	private pollIntervalSeconds: number = 10;
	private debug: boolean = false;

	public constructor(options: InitOptions) {
		this.apiKey = options.apiKey;
		this.debug = !!options.debug;
	}

	public async waitFor(options: WaitForOptions): Promise<Email> {
		const require = createRequire(import.meta.url);
		const { version } = require("../package.json");
		return new Promise(async (resolve, reject) => {
			let finished = false;
			const since = options.since || Math.floor(Date.now() / 1000);
			const timeoutMs =
				options.timeout || this.defaultTimeoutSeconds * 1000;
			const timeout = setTimeout(() => {
				finished = true;
				reject({
					message: `Timeout exceeded (${timeoutMs}ms)`,
				});
			}, timeoutMs);
			let attempt = 1;
			while (!finished) {
				let res;
				try {
					const url = `${this.baseUri}/emails?tag=${options.tag}&since=${since}&attempt=${attempt}&order=asc&limit=1`;
					this.debugMessage(`Fetching ${url}`);
					res = await fetch(url, {
						headers: {
							Authorization: `Bearer ${this.apiKey}`,
							"X-Sdk-Version": version,
						},
					});
				} catch (e) {
					finished = true;
					clearTimeout(timeout);
					reject({
						message: "Unknown error",
					});
					break;
				}
				const json = await res.json();
				if (
					res.status >= 200 &&
					res.status < 300 &&
					Array.isArray(json.data)
				) {
					if (json.data.length) {
						finished = true;
						clearTimeout(timeout);
						const rawEmail = json.data[0] as RawEmail;
						resolve(new Email(rawEmail));
						break;
					} else {
						this.debugMessage(
							`Status code ${res.status}, but no results`
						);
					}
				} else {
					this.debugMessage(`Status code ${res.status}`);
					finished = true;
					clearTimeout(timeout);
					reject({
						message: json.message || "Unknown error",
					});
					break;
				}
				await sleep(this.pollIntervalSeconds * 1000);
				attempt++;
			}
		});
	}

	private debugMessage(message: string): void {
		if (this.debug) {
			console.log(message);
		}
	}
}
