import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  extends: withRslibConfig(),
  setupFiles: ['./rstest.setup.ts'],
  plugins: [pluginReact()],
});
