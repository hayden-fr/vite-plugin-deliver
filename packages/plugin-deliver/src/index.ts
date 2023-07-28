import type { PluginOption } from 'vite'
import { resolveEntries, resolveSourcePath } from './utils'

const DEFAULT_SCOPE = '@client'

export interface DeliverOpts {
  /**
   * @default '@client'
   */
  scope?: string
}

export function deliver(opts?: DeliverOpts): PluginOption {
  return [
    {
      name: 'deliver:serve',
      apply: 'serve',
      config() {
        return {
          resolve: {
            alias: [
              {
                find: opts?.scope ?? DEFAULT_SCOPE,
                replacement: '/src',
              },
            ],
          },
        }
      },
    },
    {
      name: 'deliver:build',
      apply: 'build',
      enforce: 'post',
      config() {
        return {
          resolve: {
            alias: [
              {
                find: opts?.scope ?? DEFAULT_SCOPE,
                replacement: '/src',
                customResolver(source) {
                  const resolveId = resolveSourcePath(source)
                  return {
                    id: resolveId,
                    external: true,
                  }
                },
              },
            ],
          },
          build: {
            rollupOptions: {
              output: {
                entryFileNames: `[name].js`,
                exports: 'named',
                format: 'esm',
                externalLiveBindings: false,
                freeze: false,
              },
            },
          },
        }
      },
      configResolved(config) {
        // Use library mode instead of rollup input
        const entries = config.build.rollupOptions.input ?? {}
        config.build.lib = {
          entry: resolveEntries(entries, config.root),
          formats: ['es'],
        }
        config.build.rollupOptions.input = undefined
      },
    },
  ]
}

export default deliver
