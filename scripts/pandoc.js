require('pandocjs').ConvertFileSync(
  '.README.pandoc.json',
  'json',
  'README.md',
  'gfm'
);
