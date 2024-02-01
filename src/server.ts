import {
  Connection,
  DocumentFormattingParams,
  InitializeResult,
  Position,
  Range,
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

    connection.onInitialize(this.initialize);
    connection.onDocumentFormatting(paras => {
      return [this.formating(paras)];
    });

    this.document = document;

    this.document.onDidChangeContent(change => {
      this.parseTextDocument(change.document);
    });

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

  // LSP event handlers:

  initialize(): InitializeResult {
    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        // Tell the client that this server supports code completion.
        completionProvider: {
          resolveProvider: true,
        },
        documentFormattingProvider: true,
        documentHighlightProvider: true,
      },
    };
  }

  formating(paras: DocumentFormattingParams): TextEdit {
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
