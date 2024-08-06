import {parse} from '@djot/djot';
import {formatDjot, getASTNodesAtOffset} from './utils';

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

describe('formatDjot', () => {
  it('format djot from ast correctly', () => {
    expect(formatDjot(parse(readme))).toEqual(readme);
  });
});

describe('getASTNodesAtOffset', () => {
  it('get right node', () => {
    const doc = parse(readme, {sourcePositions: true});
    let nodes = getASTNodesAtOffset(doc, 0);
    expect(nodes.length).toEqual(3);
    nodes = getASTNodesAtOffset(doc, 1);
    expect(nodes.length).toEqual(3);
    nodes = getASTNodesAtOffset(doc, 2);
    expect(nodes.length).toEqual(4);
    nodes = getASTNodesAtOffset(doc, 10);
    expect(nodes.length).toEqual(2);
    nodes = getASTNodesAtOffset(doc, 11);
    expect(nodes.length).toEqual(5);
  });
});
