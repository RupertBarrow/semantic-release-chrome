import SemanticReleaseError from '@semantic-release/error'
import archiver from 'archiver'
import { readJsonSync, writeJsonSync } from 'fs-extra'
import template from 'lodash.template'

import { createWriteStream } from 'fs'
import { resolve } from 'path'

import type PluginConfig from './@types/pluginConfig'
import { Context } from 'semantic-release'

const prepareManifest = (
  manifestPath: string,
  version: string,
  logger: Context['logger'],
  versionName: string,
) => {
  const manifest = readJsonSync(manifestPath)

  if (versionName) {
    writeJsonSync(
      manifestPath,
      {
        ...manifest,
        version,
        version_name: versionName,
      },
      { spaces: 2 },
    )
  } else {
    writeJsonSync(manifestPath, { ...manifest, version }, { spaces: 2 })
  }

  if (versionName) {
    logger.log(
      'Wrote version %s and version_name %s to %s',
      version,
      versionName,
      manifestPath,
    )
  } else {
    logger.log('Wrote version %s to %s', version, manifestPath)
  }
}

const zipFolder = (
  asset: string,
  distFolder: string,
  logger: Context['logger'],
) => {
  const zipPath = resolve(asset)
  const output = createWriteStream(zipPath)
  const archive = archiver('zip', {})

  archive.pipe(output)

  archive.directory(distFolder, false)
  archive.finalize()

  logger.log('Wrote zipped file to %s', zipPath)
}

const MAP_CHANNEL_TO_NUMBER = {
  nightly: '1',
  alpha: '2',
  beta: '3',
  develop: '4',
  master: '6',
  latest: '7',
  next: '8',
  'next-major': '9',
}
/**
 * Attempts to parse a semantic version number from a pre-release version string.
 *
 * Context:
 * The semantic-release package will provide a version string such as '2.3.5-develop.1' when using the
 * pre-release functionality. This function will parse out the semantic version number '2.3.5.4000001' from this
 * string, so that the version will adhere to the chrome web store's version format requirement.
 *
 * The build version is built from the channel name (mapped to a digit) and the build number, padded with 0s.
 *
 * @param prereleaseVersion pre-release version string from which to parse the semantic version number
 * @returns semantic version number parsed from prereleaseVersion input. throws error if unable to parse
 */
export const parsePrereleaseVersion = (prereleaseVersion: string) => {
  const versionMatch = prereleaseVersion?.match(/\d+\.\d+\.\d+/)
  if (!versionMatch) {
    throw new SemanticReleaseError(
      'Could not parse semantic version number from pre-release version',
    )
  }
  const majorMinorPatchVersion = versionMatch?.[0] // eg 1.3.2

  const prereleaseMatch = prereleaseVersion?.match(/-(\w+)\.(\d+)/)
  if (!prereleaseMatch) {
    throw new SemanticReleaseError('Could not parse pre-release version')
  }

  const [, channelName, buildNumber] = prereleaseMatch // eg develop, 1
  const channelNumber = MAP_CHANNEL_TO_NUMBER[channelName] ?? '0'
  const buildVersion = `${channelNumber}${buildNumber.padStart(6, '0')}` // eg 4000001

  return `${majorMinorPatchVersion}.${buildVersion}`
}

const prepare = (
  { manifestPath, distFolder, asset, allowPrerelease }: PluginConfig,
  { nextRelease, logger, lastRelease, branch, commits }: Context,
) => {
  if (!asset) {
    throw new SemanticReleaseError(
      "Option 'asset' was not included in the prepare config. Check the README.md for config info.",
      'ENOASSET',
    )
  }

  const nextReleaseVersion = nextRelease?.version
  if (!nextReleaseVersion) {
    throw new SemanticReleaseError(
      'Could not determine the version from semantic release.',
    )
  }
  const versionName = nextReleaseVersion
  const version = allowPrerelease
    ? parsePrereleaseVersion(nextReleaseVersion)
    : nextReleaseVersion

  const normalizedDistFolder = distFolder || 'dist'

  const compiledAssetString = template(asset)({
    branch,
    lastRelease,
    nextRelease,
    commits,
  })

  prepareManifest(
    manifestPath || `${normalizedDistFolder}/manifest.json`,
    version,
    logger,
    versionName,
  )
  zipFolder(compiledAssetString, normalizedDistFolder, logger)
}

export default prepare
