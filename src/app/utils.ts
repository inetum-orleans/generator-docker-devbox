import { PathLike } from 'fs'

export function toCamel (str: string) {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase()
  })
}

export function walkSync (dirs: PathLike[], filelist?: string[], customFs?: any): string[] {
  var fs = customFs || require('fs')

  if (!filelist) {
    filelist = []
  }

  for (const dir of dirs) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      if (fs.statSync(dir + file).isDirectory()) {
        filelist = walkSync([dir + file + '/'], filelist)
      } else {
        filelist.push(file)
      }
    }
  }

  return filelist
}
