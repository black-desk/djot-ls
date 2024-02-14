import {formatDjot} from './format';
import {parse} from '@djot/djot';

describe('formatDjot', () => {
  const readme = `# djot-ls

A *WIP* LSP server implementation of [djot][], powered by [djot.js][].

- [X] textDocument/formatting
- [ ] textDocument/documentHighlight
- [ ] textDocument/semanticTokens/full
- [ ] textDocument/semanticTokens/full/delta
- [ ] textDocument/semanticTokens/range
- [ ] textDocument/definition
- [ ] textDocument/completion
- [ ] textDocument/rename

The markdown version README is generated from [README.dj][]
by running \`npm run update-readme\`.


[djot]: https://github.com/jgm/djot

[djot.js]: https://github.com/jgm/djot.js

[README.dj]: ./README.dj
`;
  it('format djot from ast correctly', () => {
    expect(formatDjot(parse(readme))).toEqual(readme);
  });
});
