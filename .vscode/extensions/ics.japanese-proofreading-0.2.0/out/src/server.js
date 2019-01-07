"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const textlint_1 = require("textlint");
const rule_1 = require("./rules/rule");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri = require("vscode-uri");
// サーバーへの接続を作成(すべての提案された機能も含む)
const connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
// テキストドキュメントを管理するクラスを作成します。
const documents = new vscode_languageserver_1.TextDocuments();
let hasConfigurationCapability = false;
connection.onInitialize((params) => {
    const capabilities = params.capabilities;
    hasConfigurationCapability =
        capabilities.workspace && !!capabilities.workspace.configuration;
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
        },
    };
});
connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        connection.client.register(vscode_languageserver_1.DidChangeConfigurationNotification.type, undefined);
    }
});
function getDefaultTextlintSettings() {
    const mySettings = new Map();
    rule_1.rules.forEach((value, index, array) => {
        mySettings[value.ruleName] = value.enabled;
    });
    return mySettings;
}
const defaultSettings = {
    maxNumberOfProblems: 1000,
    textlint: getDefaultTextlintSettings(),
};
let globalSettings = defaultSettings;
const documentSettings = new Map();
connection.onDidChangeConfiguration((change) => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    }
    else {
        globalSettings = (change.settings.japaneseProofreading ||
            defaultSettings);
    }
    // Revalidate all open text documents
    documents.all().forEach(validateTextDocument);
});
function getDocumentSettings(resource) {
    console.log("getDocumentSettings!!!!!!");
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: "japaneseProofreading",
        });
        documentSettings.set(resource, result);
    }
    return result;
}
// Only keep settings for open documents
documents.onDidClose((close) => {
    documentSettings.delete(close.document.uri);
    resetTextDocument(close.document);
});
// ドキュメントを初めて開いた時と内容に変更があった際に実行します。
documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});
// バリデーション（textlint）を実施
function validateTextDocument(textDocument) {
    return __awaiter(this, void 0, void 0, function* () {
        // In this simple example we get the settings for every validate run.
        const settings = yield getDocumentSettings(textDocument.uri);
        const document = textDocument.getText();
        const ext = path.extname(vscode_uri.default.parse(textDocument.uri).fsPath);
        const engine = new textlint_1.TextLintEngine({
            configFile: path.resolve(__dirname, "../.textlintrc"),
        });
        const results = yield engine.executeOnText(document, ext);
        const diagnostics = [];
        if (engine.isErrorResults(results)) {
            const messages = results[0].messages;
            const l = messages.length;
            for (let i = 0; i < l; i++) {
                const message = messages[i];
                const text = `${message.message}（${message.ruleId}）`;
                const pos = vscode_languageserver_1.Position.create(Math.max(0, message.line - 1), Math.max(0, message.column - 1));
                // 対象チェック
                if (!isTarget(settings, message.ruleId, message.message)) {
                    continue;
                }
                const diagnostic = {
                    severity: toDiagnosticSeverity(message.severity),
                    range: vscode_languageserver_1.Range.create(pos, pos),
                    message: text,
                    source: "テキスト校正くん",
                    code: message.ruleId,
                };
                diagnostics.push(diagnostic);
            }
        }
        // Send the computed diagnostics to VSCode.
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    });
}
function isTarget(settings, ruleId, message) {
    let bool = false;
    rule_1.rules.forEach((element, index, array) => {
        // prhのとき、ruleIdからprh内の細かいルールを取得できないのでmessageに含まれているか取得している
        if (ruleId === "prh") {
            const ruleIdSub = element.ruleId.split("/")[1];
            if (message.includes(`（${ruleIdSub}）`)) {
                bool = settings.textlint[element.ruleName];
            }
        }
        else if (element.ruleId === ruleId) {
            bool = settings.textlint[element.ruleName];
        }
    });
    return bool;
}
/**
 * validate済みの内容を破棄します。
 * @param textDocument
 */
function resetTextDocument(textDocument) {
    return __awaiter(this, void 0, void 0, function* () {
        const diagnostics = [];
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    });
}
function toDiagnosticSeverity(severity) {
    switch (severity) {
        case 0:
            return vscode_languageserver_1.DiagnosticSeverity.Information;
        case 1:
            return vscode_languageserver_1.DiagnosticSeverity.Warning;
        case 2:
            return vscode_languageserver_1.DiagnosticSeverity.Error;
    }
    return vscode_languageserver_1.DiagnosticSeverity.Information;
}
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
