import { Attachment } from "./attachment.interface";

export interface Email {
	id: number;
	date: string;
	tag: string;
	from: string;
	subject: string;
	attachments: Attachment[];
	htmlBody: string;
	textBody: string;
}
