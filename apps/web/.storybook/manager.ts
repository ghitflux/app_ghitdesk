import { addons } from "@storybook/manager-api";
import { themes } from "@storybook/theming";

addons.setConfig({
  theme: themes.dark,
  toolbar: {
    title: { hidden: false },
    subtitle: { hidden: false },
  },
});
