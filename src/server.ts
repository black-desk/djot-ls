import {
  Connection,
  DocumentFormattingParams,
  InitializeResult,
  Position,
  Range,
  TextDocumentChangeEvent,
  TextDocumentSyncKind,
  TextDocuments,
  TextEdit,
} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {parse, renderDjot} from '@djot/djot';

type AST = ReturnType<typeof parse>;

class DjotLanguageServer {
  connection: Connection;
  document: TextDocuments<TextDocument>;
  asts: Map<string, AST> = new Map();

  constructor(connection: Connection, document: TextDocuments<TextDocument>) {
    this.connection = connection;
    this.connection.onInitialize(this.lspInitialize);
    this.connection.onDocumentFormatting(paras => {
      return [this.lspFormating(paras)];
    });

    this.document = document;
    this.document.onDidChangeContent(this.lspChangeContent);
    this.document.listen(this.connection);
  }

  run() {
    this.connection.listen();
  }

  parseTextDocument(textDocument: TextDocument) {
    const text = textDocument.getText();
    console.error(text);
    const ast = parse(text);
    this.asts.set(textDocument.uri, ast);
    return ast;
  }

  lspChangeContent(change: TextDocumentChangeEvent<TextDocument>) {
    this.parseTextDocument(change.document);
  }

  lspInitialize(): InitializeResult {
    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        documentFormattingProvider: true,
      },
    };
  }

  lspFormating(paras: DocumentFormattingParams): TextEdit {
    let ast = this.asts.get(paras.textDocument.uri);
    const document = this.document.get(paras.textDocument.uri);
    if (document === undefined) {
      throw 'Unknow document ' + paras.textDocument.uri;
    }
    if (!ast) {
      ast = this.parseTextDocument(document);
    }

    const formated = renderDjot(ast).replace(/ +[\r\n]/gm, '\n');
    return TextEdit.replace(
      Range.create(
        Position.create(0, 0),
        document.positionAt(document.getText().length)
      ),
      formated
    );
  }
}

export {DjotLanguageServer};
