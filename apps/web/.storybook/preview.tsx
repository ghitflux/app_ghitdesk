import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import "../src/app/globals.css";

initialize();

const preview: Preview = {
  loaders: [mswLoader],

  decorators: [
    (Story) => (
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <HeroUIProvider>
          <div className="bg-background text-foreground min-h-screen p-8">
            <Story />
          </div>
        </HeroUIProvider>
      </NextThemesProvider>
    ),
  ],

  parameters: {
    layout: "fullscreen",
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0B0C10" },
        { name: "light", value: "#FFFFFF" },
        { name: "surface", value: "#161823" },
      ],
    },
  },
};

export default preview;
