/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */

import { join } from "path";
import type { CompositeOperationString, ImageAsset } from "@akashic/pdi-types";
import type { Page } from "puppeteer";

describe("Renderer", () => {
	const timeout = 5000;

	let page: Page;

	beforeAll(async () => {
		page = await globalThis.__BROWSER_GLOBAL__.newPage();
		await page.setViewport({ width: 1280, height: 720 });
		await page.goto(process.env.BASE_URL);
	}, timeout);

	afterAll(async () => {
		await page.close();
	});

	beforeEach(async () => {
		await page.reload();
	});

	const compositeOperations: CompositeOperationString[] = [
		"source-atop",
		"source-over",
		"lighter",
		"copy",
		"destination-out",
		"destination-over",
		"xor",
		"experimental-source-in",
		"experimental-source-out",
		"experimental-destination-in",
		"experimental-destination-atop",
		"difference",
		"saturation"
	];

	for (const rendererCandidate of ["canvas", "webgl"]) {
		it(`rendering (${rendererCandidate}) - compares composite operations with rects`, async () => {
			await page.evaluate((candidate, ops) => {
				const platform = window.__mock__.preparePlatform({
					primarySurfaceWidth: 1280,
					primarySurfaceHeight: 720,
					rendererCandidates: [candidate]
				});
				const primarySurface = platform.getPrimarySurface();
				const primaryRenderer = primarySurface.renderer();
				const resourceFactory = platform.getResourceFactory();

				primaryRenderer.begin();
				primaryRenderer.clear();

				for (let i = 0; i < ops.length; i++) {
					const op = ops[i];
					const surface = resourceFactory.createSurface(150, 150);
					const renderer = surface.renderer();

					renderer.begin();
					renderer.clear();

					{
						renderer.save();
						renderer.setOpacity(0.8);
						renderer.translate(30, 30);
						renderer.fillRect(0, 0, 70, 70, "blue");
						renderer.setCompositeOperation(op);
						renderer.fillRect(20, 20, 70, 70, "red");
						renderer.restore();
					}

					renderer.end();

					const offsetX = (i % 5) * 200;
					const offsetY = Math.floor(i / 5) * 200;

					primaryRenderer.fillRect(offsetX, offsetY, 150, 150, "lightgray");
					primaryRenderer.drawImage(surface, 0, 0, 150, 150, offsetX, offsetY);
				}

				primaryRenderer.end();
			}, rendererCandidate, compositeOperations);

			await page.screenshot({ path: join(__dirname, "results", `composite-operations-rects-${rendererCandidate}.png`) });

			// TODO: Canvas と WebGL で描画差異が無いことを確認 (現状は描画差異があるのでテストは不実行)
		});

		it(`rendering (${rendererCandidate}) - compares composite operations with rects`, async () => {
			await page.evaluate((candidate, ops) => {
				const platform = window.__mock__.preparePlatform({
					primarySurfaceWidth: 1280,
					primarySurfaceHeight: 720,
					rendererCandidates: [candidate]
				});
				const primarySurface = platform.getPrimarySurface();
				const primaryRenderer = primarySurface.renderer();
				const resourceFactory = platform.getResourceFactory();

				const render = (asset: ImageAsset): void => {
					primaryRenderer.begin();
					primaryRenderer.clear();

					const imageSurface = asset.asSurface();

					for (let i = 0; i < ops.length; i++) {
						const op = ops[i];
						const surface = resourceFactory.createSurface(150, 150);
						const renderer = surface.renderer();

						renderer.begin();
						renderer.clear();

						{
							renderer.save();
							renderer.setOpacity(0.8);
							renderer.fillRect(30, 30, 90, 90, "blue");
							renderer.setCompositeOperation(op);
							renderer.drawImage(imageSurface, 0, 0, 150, 107, 0, 0);
							renderer.restore();
						}

						renderer.end();

						const offsetX = (i % 5) * 200;
						const offsetY = Math.floor(i / 5) * 200;

						primaryRenderer.fillRect(offsetX, offsetY, 150, 150, "lightgray");
						primaryRenderer.drawImage(surface, 0, 0, 150, 150, offsetX, offsetY);
					}

					primaryRenderer.end();
				};

				const asset = resourceFactory.createImageAsset("akashic", "/image/akashic.png", 150, 107);
				asset._load({
					_onAssetLoad: (asset: ImageAsset) => {
						render(asset);
					},
					_onAssetError: () => {
						throw new Error("oops");
					},
				});
			}, rendererCandidate, compositeOperations);

			await page.screenshot({ path: join(__dirname, "results", `composite-operations-images-${rendererCandidate}.png`) });

			// TODO: Canvas と WebGL で描画差異が無いことを確認 (現状は描画差異があるのでテストは不実行)
		});
	}
});
