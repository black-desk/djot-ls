import {Doc, renderDjot} from '@djot/djot';

function formatDjot(ast: Doc): string {
  return renderDjot(ast).replace(/ +[\r\n]/gm, '\n');
}

export {formatDjot};
