#!/bin/env node

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
} from 'vscode-languageserver/node';

import {TextDocument} from 'vscode-languageserver-textdocument';
import {DjotLanguageServer} from './server';

const connection = createConnection(ProposedFeatures.all);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

const server = new DjotLanguageServer(connection, documents);

server.run();
