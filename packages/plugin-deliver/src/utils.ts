import type { Rollup } from 'vite'
import path from 'node:path'
import { glob } from 'fast-glob'

const SCRIPT_SUFFIX = '{tsx,ts,jsx,js}'

export function resolveEntries(entries: Rollup.InputOption = {}, root: string) {
  if (typeof entries === 'object' && !Array.isArray(entries)) {
    return entries
  }
  const points = typeof entries === 'string' ? [entries] : entries
  const entryPoints = new Map<string, string>()

  const patterns = points.map((pattern) => {
    return path.extname(pattern) ? pattern : `${pattern}.${SCRIPT_SUFFIX}`
  })

  glob.sync(patterns, { cwd: root, onlyFiles: true }).forEach((filename) => {
    const sourcePath = path.posix.join('./', filename)
    const resolvedPath = resolveSourcePath(sourcePath)
    const pointName = path.posix.join('./', resolvedPath).replace('.js', '')
    entryPoints.set(pointName, sourcePath)
  })

  return Object.fromEntries(entryPoints.entries())
}

/**
 * @param source original source path
 * @returns
 */
export function resolveSourcePath(source: string) {
  return source.replace(/^(\.?\/?src)?(.*?)(\/index)?(\.\w+)?$/, '$2.js')
}
