import { Attachment, RawAttachment } from "./attachment.interface";
import { Link } from "./link.interface";
import { Image } from "./image.interface";

export interface RawEmail {
	id: number;
	date: string;
	tag: string;
	from: string;
	subject: string;
	attachments: RawAttachment[];
	html_body: string;
	text_body: string;
}
