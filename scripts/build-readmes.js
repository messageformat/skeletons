const { readdirSync, readFileSync, writeFileSync } = require('fs')
const { relative, resolve } = require('path')

function getPackageInfo(pkgDir) {
  const pkgSrc = readFileSync(resolve(pkgDir, 'package.json'), 'utf8')
  const { repository, name } = JSON.parse(pkgSrc)

  const url = repository.url.replace(/\.git$/, `/blob/master/docs/${name}`)
  return { name, url }
}

function getReadme(name, url) {
  const bodySrc = readFileSync(resolve(`docs/${name}.md`), 'utf8')
  const headEnd = bodySrc.indexOf(`## ${name}`)
  const linkRe = new RegExp(`\\./${name}\\b`, 'g')
  const body = bodySrc
    .slice(headEnd)
    .replace(/^.*/, `# ${name}`)
    .replace(/#+ Remarks\s*/, '')
    .replace(linkRe, url)
    .trim()

  const footer = `\n\n---\n
[Messageformat] is an OpenJS Foundation project, and we follow its [Code of Conduct].

[messageformat]: https://messageformat.github.io/
[code of conduct]: https://github.com/openjs-foundation/cross-project-council/blob/master/CODE_OF_CONDUCT.md

<a href="https://openjsf.org">
<img width=200 alt="OpenJS Foundation" src="https://messageformat.github.io/messageformat/logo/openjsf.svg" />
</a>`
  return body + footer
}

const pkgRoot = resolve('packages')
for (const pkg of readdirSync(pkgRoot)) {
  const pkgDir = resolve(pkgRoot, pkg)
  const { name, url } = getPackageInfo(pkgDir)
  const readme = getReadme(name, url)
  const readmePath = resolve(pkgDir, 'README.md')
  console.log(`Writing ${relative('.', readmePath)}`)
  writeFileSync(readmePath, readme)
}
