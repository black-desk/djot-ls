import {
  Connection,
  DocumentFormattingParams,
  DocumentHighlight,
  DocumentHighlightParams,
  InitializeResult,
  Position,
  Range,
  TextDocumentChangeEvent,
  TextDocumentSyncKind,
  TextDocuments,
  TextEdit,
} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {Doc, parse} from '@djot/djot';
import {formatDjot, getASTNodesAtOffset, toLSPRange} from './utils';

class DjotLanguageServer {
  connection: Connection;
  document: TextDocuments<TextDocument>;
  asts: Map<string, Doc> = new Map();

  constructor(connection: Connection, document: TextDocuments<TextDocument>) {
    this.connection = connection;
    this.connection.onInitialize(() => {
      return this.lspInitialize();
    });
    this.connection.onDocumentFormatting(paras => {
      return [this.lspFormating(paras)];
    });
    this.connection.onDocumentHighlight(paras => {
      return this.lspDocumentHighlight(paras);
    });

    this.document = document;
    this.document.onDidChangeContent(paras => {
      return this.lspChangeContent(paras);
    });
    this.document.listen(this.connection);
  }

  run() {
    this.connection.listen();
  }

  parseTextDocument(textDocument: TextDocument) {
    const text = textDocument.getText();
    const ast = parse(text, {sourcePositions: true});
    this.asts.set(textDocument.uri, ast);
    return ast;
  }

  getASTAndDocument(uri: string): [Doc, TextDocument] {
    const document = this.document.get(uri);
    if (!document) {
      throw 'Unknow document ' + uri;
    }

    const ast = this.asts.get(uri);
    if (!ast) {
      return [this.parseTextDocument(document), document];
    }

    return [ast, document];
  }

  lspChangeContent(change: TextDocumentChangeEvent<TextDocument>) {
    this.parseTextDocument(change.document);
  }

  lspInitialize(): InitializeResult {
    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        documentFormattingProvider: true,
        documentHighlightProvider: true,
      },
    };
  }

  lspFormating(paras: DocumentFormattingParams): TextEdit {
    const [ast, document] = this.getASTAndDocument(paras.textDocument.uri);
    const formated = formatDjot(ast);
    return TextEdit.replace(
      Range.create(
        Position.create(0, 0),
        document.positionAt(document.getText().length)
      ),
      formated
    );
  }

  lspDocumentHighlight(paras: DocumentHighlightParams): DocumentHighlight[] {
    const [ast, document] = this.getASTAndDocument(paras.textDocument.uri);
    const offset = document.offsetAt(paras.position);
    const nodes = getASTNodesAtOffset(ast, offset);
    const node = nodes[nodes.length - 1];
    const pos = node.pos;
    if (!pos) {
      return [];
    }

    const range = Range.create(
      document.positionAt(pos.start.offset),
      document.positionAt(pos.end.offset + 1)
    );

    this.connection.console.error(JSON.stringify(range));

    return [DocumentHighlight.create(range)];
  }
}

export {DjotLanguageServer};
