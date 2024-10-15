import { Attachment } from "./attachment.interface";

export interface Email {
	id: number;
	date: string;
	namespace: string;
	tag: string;
	from: string;
	subject: string;
	attachments: Attachment[];
	text_html: string;
	text_body: string;
}
