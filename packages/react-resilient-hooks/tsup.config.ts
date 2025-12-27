import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'hooks/useNetworkStatus': 'src/hooks/useNetworkStatus.ts',
    'hooks/useAdaptiveImage': 'src/hooks/useAdaptiveImage.ts',
    'hooks/useAdaptivePolling': 'src/hooks/useAdaptivePolling.ts',
    'hooks/useBackgroundSync': 'src/hooks/useBackgroundSync.ts',
    stores: 'src/stores/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react'],
  treeshake: true,
  splitting: false,
});
