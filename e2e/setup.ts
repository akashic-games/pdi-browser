import { mkdir, writeFile } from "fs/promises";
import * as http from "http";
import { tmpdir } from "os";
import * as path from "path";
import type { Platform, RendererRequirement } from "@akashic/pdi-types";
import { getPortPromise } from "portfinder";
import type { Browser } from "puppeteer";
import { launch } from "puppeteer";

const handler = require("serve-handler"); // eslint-disable-line @typescript-eslint/no-require-imports

declare global {
	// eslint-disable-next-line no-var
	var server: http.Server;
	// eslint-disable-next-line no-var
	var __BROWSER_GLOBAL__: Browser;

	namespace NodeJS {
		interface ProcessEnv {
			HOST: string;
			PORT: number;
			BASE_URL: string;
		}
	}

	interface Window {
		__mock__: {
			preparePlatform: (rendererRequirement: RendererRequirement) => Platform;
			MockAudioSystem: any;
		};
	}
}

const DIR = path.join(tmpdir(), "jest_puppeteer_global_setup");

export default async (): Promise<void> => {
	const port = await getPortPromise();
	const host = "localhost";
	const baseUrl = `http://${host}:${port}`;

	const server = http.createServer((request, response) => {
		handler(request, response, {
			public: path.resolve(__dirname, "public"),
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": "true"
			}
		});
	});
	server.listen(port, host);
	globalThis.server = server;

	const browser = await launch({ dumpio: true });
	globalThis.__BROWSER_GLOBAL__ = browser;
	await mkdir(DIR, {recursive: true});
	await writeFile(path.join(DIR, "wsEndpoint"), browser.wsEndpoint());

	process.env.HOST = host;
	process.env.PORT = port;
	process.env.BASE_URL = baseUrl;
};
