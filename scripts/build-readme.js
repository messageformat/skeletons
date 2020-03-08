const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const pkgSrc = readFileSync(resolve('package.json'), 'utf8')
const { repository, name } = JSON.parse(pkgSrc)

let url = repository.url.replace(/\.git$/, '/blob/master')
if (repository.directory) url = `${url}/${repository.directory}`

const footer = `\n\n---

[Messageformat](https://messageformat.github.io/) is an OpenJS Foundation project, and we follow its [Code of Conduct](https://github.com/openjs-foundation/cross-project-council/blob/master/CODE_OF_CONDUCT.md).

<a href="https://openjsf.org">
<img width=200 alt="OpenJS Foundation" src="https://messageformat.github.io/messageformat/logo/openjsf.svg" />
</a>`

const bodySrc = readFileSync(resolve(`docs/${name}.md`), 'utf8')
const headEnd = bodySrc.indexOf(`## ${name}`)

const linkRe = new RegExp(`\\./${name}\\b`, 'g')
const body = bodySrc
  .slice(headEnd)
  .replace(/^.*/, `# ${name}`)
  .replace(linkRe, `${url}/docs/${name}`)
  .trim()

const readmePath = resolve('README.md')
writeFileSync(readmePath, body + footer)
