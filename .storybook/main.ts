import type { StorybookConfig } from 'storybook-react-rsbuild';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['storybook-addon-rslib'],
  framework: {
    name: 'storybook-react-rsbuild',
    options: {},
  },
};

export default config;
