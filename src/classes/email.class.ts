import { RawEmail } from "../interfaces/email.interface";
import { Attachment } from "../interfaces/attachment.interface";
import { Link } from "../interfaces/link.interface";
import { Image } from "../interfaces/image.interface";
import { extractImages, extractLinks } from "../functions.js";

export class Email {
	public id: number;
	public date: string;
	public tag: string;
	public from: string;
	public subject: string;
	public links: Link[];
	public images: Image[];
	public attachments: Attachment[];
	public htmlBody: string;
	public textBody: string;

	constructor(data: RawEmail) {
		this.id = data.id;
		this.date = data.date;
		this.tag = data.tag;
		this.from = data.from;
		this.subject = data.subject;
		this.links = extractLinks(data.html_body);
		this.images = extractImages(data.html_body);
		this.attachments = data.attachments.map((attachment) => {
			return {
				size: attachment.size,
				filename: attachment.filename,
				contentType: attachment.content_type,
			};
		});
		this.htmlBody = data.html_body;
		this.textBody = data.text_body;
	}
}
