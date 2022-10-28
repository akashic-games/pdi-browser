import { JSDOM } from "jsdom";

export default (): void => {
	const dom = new JSDOM();
	globalThis.document = dom.window.document;
};
