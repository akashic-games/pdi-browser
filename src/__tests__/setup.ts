import * as http from "http";
import * as path from "path";
import { JSDOM } from "jsdom";
import { getPortPromise } from "portfinder";
const handler = require("serve-handler"); // eslint-disable-line @typescript-eslint/no-var-requires

declare global {
	// eslint-disable-next-line no-var
	var server: http.Server;

	namespace NodeJS {
		interface ProcessEnv {
			HOST: string;
			PORT: number;
			BASE_URL: string;
		}
	}
}

export default async (): Promise<void> => {
	const port = await getPortPromise();
	const host = "localhost";
	const baseUrl = `http://${host}:${port}`;

	const server = http.createServer((request, response) => {
		handler(request, response, {
			public: path.resolve(__dirname, "fixtures"),
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": "true"
			}
		});
	});
	server.listen(port, host);
	globalThis.server = server;

	const dom = new JSDOM();
	globalThis.document = dom.window.document;

	process.env.HOST = host;
	process.env.PORT = port;
	process.env.BASE_URL = baseUrl;
};
