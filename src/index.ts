import { sleep } from "./functions.js";
import { Email } from "./interfaces/email.interface";
import { InitOptions } from "./interfaces/init-options.interface";
import { WaitForOptions } from "./interfaces/wait-for-options.interface";

export default class Chomp {
	private baseUri = "https://api.chomp.email";
	private apiKey: string;
	private defaultTimeoutSeconds: number = 180;
	private pollIntervalSeconds: number = 10;

	public constructor(options: InitOptions) {
		this.apiKey = options.apiKey;
	}

	public async waitFor(options: WaitForOptions): Promise<Email> {
		return new Promise(async (resolve, reject) => {
			let finished = false;
			const since = options.since || Math.floor(Date.now() / 1000);
			const timeoutMs =
				options.timeout || this.defaultTimeoutSeconds * 1000;
			const timeout = setTimeout(() => {
				finished = true;
				reject({
					error: `Timeout exceeded (${timeoutMs}ms)`,
				});
			}, timeoutMs);
			let attempt = 1;
			while (!finished) {
				let res;
				try {
					res = await fetch(
						`${this.baseUri}/emails?tag=${options.tag}&since=${since}&attempt=${attempt}&order=asc&limit=1`,
						{
							headers: {
								Authorization: `Bearer ${this.apiKey}`,
							},
						}
					);
				} catch (e) {
					finished = true;
					clearTimeout(timeout);
					reject({
						error: "Unknown error",
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
						const raw = json.data[0];
						const email = {
							id: raw.id,
							date: raw.date,
							tag: raw.tag,
							from: raw.from,
							subject: raw.subject,
							attachments: raw.attachments.map((attachment) => {
								return {
									size: attachment.size,
									filename: attachment.filename,
									contentType: attachment.content_type,
								};
							}),
							htmlBody: raw.html_body,
							textBody: raw.text_body,
						};
						resolve(email);
						break;
					}
				} else {
					finished = true;
					clearTimeout(timeout);
					reject({
						error: json.error,
					});
					break;
				}
				await sleep(this.pollIntervalSeconds * 1000);
				attempt++;
			}
		});
	}
}
