This monorepo hosts the following [messageformat] dependencies:

- [messageformat-date-skeleton](packages/date-skeleton) - Tools for working with [ICU DateFormat skeletons]
- [messageformat-number-skeleton](packages/number-skeleton) - Tools for working with [ICU NumberFormat skeletons]

These are separate form the [main monorepo] as they're written in TypeScript, and their build, test & documentation tooling is different from the rest.

To get started with these, clone this repo and run `npm install && npm test && npm run build`. Contributors will need to sign the [OpenJS Foundation CLA]; you should get a prompt to do so after filing a PR.

[messageformat]: https://messageformat.github.io/
[icu dateformat skeletons]: http://userguide.icu-project.org/formatparse/datetime
[icu numberformat skeletons]: https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md
[main monorepo]: https://github.com/messageformat/messageformat
[openjs foundation cla]: https://openjsf.org/about/the-openjs-foundation-cla/

---

[Messageformat] is an OpenJS Foundation project, and we follow its [Code of Conduct](https://github.com/openjs-foundation/cross-project-council/blob/master/CODE_OF_CONDUCT.md).

<a href="https://openjsf.org">
<img width=200 alt="OpenJS Foundation" src="https://messageformat.github.io/messageformat/logo/openjsf.svg" />
</a>
