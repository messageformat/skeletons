const fs = require('fs')
const path = require('path')
const { homepage, name } = require('../package.json')

const footer = `\n\n---

[Messageformat](https://messageformat.github.io/) is an OpenJS Foundation project, and we follow its [Code of Conduct](https://github.com/openjs-foundation/cross-project-council/blob/master/CODE_OF_CONDUCT.md).

<a href="https://openjsf.org">
<img width=200 alt="OpenJS Foundation" src="https://messageformat.github.io/messageformat/logo/openjsf.svg" />
</a>`

const bodySrcPath = path.resolve(
  __dirname,
  '../docs/messageformat-number-skeleton.md'
)
const bodySrc = fs.readFileSync(bodySrcPath, 'utf8')
const headEnd = bodySrc.indexOf(`## ${name}`)

const linkRe = new RegExp(`\\./${name}\\b`, 'g')
const body = bodySrc
  .slice(headEnd)
  .replace(/^.*/, `# ${name}`)
  .replace(linkRe, `${homepage}/blob/master/docs/${name}`)
  .trim()

const readmePath = path.resolve(__dirname, '../README.md')
fs.writeFileSync(readmePath, body + footer)
