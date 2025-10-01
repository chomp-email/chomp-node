import { Link } from "./interfaces/link.interface";
import { Image } from "./interfaces/image.interface";

export async function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

export function extractLinks(html: string): Link[] {
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

export function extractImages(html: string): Image[] {
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
