import { describe, expect, test } from '@jest/globals'
import { parsePrereleaseVersion } from './prepare'
import SemanticReleaseError from '@semantic-release/error'

describe('parsePrereleaseVersion', () => {
  test('success case - typical semantic-release prerelease version string (develop)', () => {
    expect(parsePrereleaseVersion('1.0.0-develop.1')).toContain('1.0.0.')
    expect(parsePrereleaseVersion('1.0.0-develop.1').length).toBeLessThan(12)
    expect((parsePrereleaseVersion('1.0.0-develop.1').split('.')[3] as unknown as number) - 65536).toBeLessThan(0)
  })

  test('success case - typical semantic-release prerelease version string (alpha)', () => {
    expect(parsePrereleaseVersion('1.3.0-alpha.2')).toContain('1.3.0.')
    expect(parsePrereleaseVersion('1.3.0-alpha.2').length).toBeLessThan(12)
    expect((parsePrereleaseVersion('1.3.0-alpha.2').split('.')[3] as unknown as number) - 65536).toBeLessThan(0)
  })
  test('success case - semantic-release prerelease version string with unknown channel', () => {
    expect(parsePrereleaseVersion('1.3.0-unknown.2')).toContain('1.3.0.')
    expect(parsePrereleaseVersion('1.3.0-unknown.2').length).toBeLessThan(12)
    expect((parsePrereleaseVersion('1.3.0-unknown.2').split('.')[3] as unknown as number) - 65536).toBeLessThan(0)
  })

  test('success case - normal semantic-release version string', () => {
    expect(parsePrereleaseVersion('1.0.0')).toEqual('1.0.0')
  })

  test('failure case - no semantic-release version in string', () => {
    expect(() => {
      parsePrereleaseVersion('develop.1')
    }).toThrow(SemanticReleaseError)
  })

  test('failure case - empty string', () => {
    expect(() => {
      parsePrereleaseVersion('')
    }).toThrow(SemanticReleaseError)
  })
})
