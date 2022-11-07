import { rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const DIR = join(tmpdir(), "jest_puppeteer_global_setup");

export default async (): Promise<void> => {
	globalThis.server.close();
	await globalThis.__BROWSER_GLOBAL__.close();
	await rm(DIR, {recursive: true, force: true});
};
