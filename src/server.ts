#!/bin/env node

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
  TextEdit,
  Range,
  Position,
} from 'vscode-languageserver/node';

import {parse, renderDjot} from '@djot/djot';

import {TextDocument} from 'vscode-languageserver-textdocument';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  result.capabilities.documentFormattingProvider = true;
  result.capabilities.documentHighlightProvider = true;
  return result;
});

type AST = ReturnType<typeof parse>;

// Cache the settings of all open documents
const textDocumentsASTs: Map<string, AST> = new Map();

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  console.error('change');
  parseTextDocument(change.document);
});

function parseTextDocument(textDocument: TextDocument) {
  const text = textDocument.getText();
  console.error(text);
  const ast = parse(text);
  textDocumentsASTs.set(textDocument.uri, ast);
  return ast;
}

connection.onDocumentFormatting(formatting => {
  let ast = textDocumentsASTs.get(formatting.textDocument.uri);
  const document = documents.get(formatting.textDocument.uri);
  if (document === undefined) {
    throw 'Unknow document ' + formatting.textDocument.uri;
  }
  if (ast === undefined) {
    ast = parseTextDocument(document);
  }

  const formated = renderDjot(ast);
  return [
    TextEdit.replace(
      Range.create(
        Position.create(0, 0),
        document.positionAt(document.getText().length)
      ),
      formated
    ),
  ];
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
