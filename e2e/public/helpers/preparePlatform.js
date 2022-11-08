import { MockAMFlow } from "./MockAMFlow.js";

export function preparePlatform(rendererRequirement) {
  const { Platform } = require("@akashic/pdi-browser");

  if (window.__mock__.platform) {
    return window.__mock__.platform;
  }

  const amflow = new MockAMFlow();
  const containerView = document.getElementById("container-view");
  const platform = new Platform({ amflow, containerView });
  platform.setRendererRequirement(rendererRequirement);
  window.__mock__.platform = platform;
  return platform;
}
