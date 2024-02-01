import {
  AstNode,
  Doc,
  HasChildren,
  Pos,
  SourceLoc,
  renderDjot,
} from '@djot/djot';
import {Position, Range} from 'vscode-languageserver';

function formatDjot(ast: Doc): string {
  return renderDjot(ast).replace(/ +[\r\n]/gm, '\n');
}

function getASTNodesAtOffset(node: AstNode, offset: number): AstNode[] {
  const tmp = node as HasChildren<AstNode>;
  if (!tmp) {
    return [node];
  }
  if (!tmp.children) {
    return [node];
  }

  for (const child of tmp.children) {
    if (
      child.pos &&
      child.pos.start.offset <= offset &&
      offset <= child.pos.end.offset
    ) {
      return [node, ...getASTNodesAtOffset(child, offset)];
    }
  }

  return [node];
}

function toLSPPosistion(p: SourceLoc): Position {
  return Position.create(p.line - 1, Math.max(p.col, 0));
}

function toLSPRange(p: Pos): Range {
  return Range.create(toLSPPosistion(p.start), toLSPPosistion(p.end));
}

export {toLSPRange, toLSPPosistion, formatDjot, getASTNodesAtOffset};
