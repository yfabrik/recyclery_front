import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { configure, prettyDOM } from "storybook/test";
import { utils } from "vitest/browser";
import * as projectAnnotations from "./preview";

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

const PRETTY_DOM_MAX = 800;

utils.configurePrettyDOM({
  maxLength: PRETTY_DOM_MAX,
  filterNode:
    "[aria-hidden='true'], .sb-preparing-story, .sb-preparing-docs, .sb-errordisplay, script, style",
});

configure({
  getElementError: (message, container) => {
    const error = new Error(
      [message, prettyDOM(container, PRETTY_DOM_MAX)].filter(Boolean).join("\n\n"),
    );
    error.name = "TestingLibraryElementError";
    return error;
  },
});
