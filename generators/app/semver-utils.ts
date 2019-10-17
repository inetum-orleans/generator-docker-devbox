import * as semver from 'semver'

export function sort (tags: string[]): string[] {
  return sortTagsImpl(tags, semver.sort)
}

export function rsort (tags: string[]): string[] {
  return sortTagsImpl(tags, semver.rsort)
}

function sortTagsImpl (tags: string[], sortFunction = semver.rsort): string[] {
  const versionToTag: { [version: string]: string } = {}
  const tagToVersion: { [tag: string]: string } = {}

  tags.forEach((tag) => {
    let version: string | null = null
    let coerced = semver.coerce(tag)
    if (coerced) {
      version = coerced.format()
      versionToTag[version] = tag
      tagToVersion[tag] = version
    }
  })

  const sortedVersions = sortFunction(tags.filter(tag => !!tagToVersion[tag]).map(tag => tagToVersion[tag] || tag))
  const sortedTags = sortedVersions.map(version => versionToTag[version.toString()] || version)
  const otherTags = tags.filter(tag => !tagToVersion[tag])
  return [...sortedTags, ...otherTags]
}
