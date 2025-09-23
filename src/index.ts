import { sleep } from "./functions.js";
import { Email, RawEmail } from "./interfaces/email.interface";
import { InitOptions } from "./interfaces/init-options.interface";
import { Link } from "./interfaces/link.interface.js";
import { Image } from "./interfaces/image.interface.js";
import { WaitForOptions } from "./interfaces/wait-for-options.interface";

export default class Chomp {
	private baseUri = "https://api.chomp.email";
	private apiKey: string;
	private defaultTimeoutSeconds: number = 180;
	private pollIntervalSeconds: number = 10;
	private debug: boolean = false;

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
					const url = `${this.baseUri}/emails?tag=${options.tag}&since=${since}&attempt=${attempt}&order=asc&limit=1`;
					this.debugMessage(`Fetching ${url}`);
					res = await fetch(url, {
						headers: {
							Authorization: `Bearer ${this.apiKey}`,
						},
					});
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
						const rawEmail = json.data[0] as RawEmail;
						resolve(this.parseResponse(rawEmail));
						break;
					} else {
						this.debugMessage(
							`Status code ${res.status}, nut no results`
						);
					}
				} else {
					this.debugMessage(`Status code ${res.status}`);
					finished = true;
					clearTimeout(timeout);
					reject({
						error: json.error || json.message,
					});
					break;
				}
				await sleep(this.pollIntervalSeconds * 1000);
				attempt++;
			}
		});
	}

	private parseResponse(rawEmail: RawEmail): Email {
		const email = {
			id: rawEmail.id,
			date: rawEmail.date,
			tag: rawEmail.tag,
			from: rawEmail.from,
			subject: rawEmail.subject,
			links: this.extractLinks(rawEmail.html_body),
			images: this.extractImages(rawEmail.html_body),
			attachments: rawEmail.attachments.map((attachment) => {
				return {
					size: attachment.size,
					filename: attachment.filename,
					contentType: attachment.content_type,
				};
			}),
			htmlBody: rawEmail.html_body,
			textBody: rawEmail.text_body,
		};

		return email;
	}

	private extractLinks(html: string): Link[] {
		const regex = /<a\s[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
		const links: Link[] = [];
		let match;

		while ((match = regex.exec(html)) !== null) {
			links.push({
				href: match[1],
				text: match[2].replace(/<[^>]+>/g, "").trim(),
			});
		}

		return links;
	}

	private extractImages(html: string): Image[] {
		const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
		const images: Image[] = [];
		let match;

		while ((match = regex.exec(html)) !== null) {
			images.push({
				src: match[1],
			});
		}

		return images;
	}

	private debugMessage(message: string): void {
		if (this.debug) {
			console.log(message);
		}
	}
}
