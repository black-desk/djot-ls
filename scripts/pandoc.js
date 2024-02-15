// eslint-disable-next-line node/no-unpublished-require
require('pandocjs').ConvertFileSync(
  '.README.pandoc.json',
  'json',
  'README.md',
  'gfm'
);
