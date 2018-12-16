'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const csvPreview_1 = require("./csvPreview");
const excelPreview_1 = require("./excelPreview");
const previewManager_1 = require("./previewManager");
const path = require("path");
function activate(context) {
    // CSV: Open Preview
    let csvCommand = vscode_1.commands.registerCommand('csv.preview', (uri) => {
        let resource = uri;
        let viewColumn = getViewColumn();
        if (!(resource instanceof vscode_1.Uri)) {
            if (vscode_1.window.activeTextEditor) {
                resource = vscode_1.window.activeTextEditor.document.uri;
                viewColumn = vscode_1.window.activeTextEditor.viewColumn;
            }
            else {
                vscode_1.window.showInformationMessage("Open a CSV file first to show a preview.");
                return;
            }
        }
        let preview = new csvPreview_1.default(context, resource, viewColumn);
        return preview.webview;
    });
    // Excel: Open Preview
    let excelCommand = vscode_1.commands.registerCommand('excel.preview', (uri) => {
        let resource = uri;
        let viewColumn = getViewColumn();
        if (!(resource instanceof vscode_1.Uri)) {
            vscode_1.window.showInformationMessage("Use the explorer context menu or editor title menu to preview Excel files.");
            return;
        }
        let preview = new excelPreview_1.default(context, resource, viewColumn);
        return preview.webview;
    });
    // CSV: Clear Preview State
    let clearCommand = vscode_1.commands.registerCommand('csv.clearState', () => {
        let preview = previewManager_1.previewManager.active();
        if (preview) {
            let key = preview.previewUri.toString();
            if (preview.storage.get(key)) {
                preview.storage.update(key, null);
                preview.refresh();
            }
        }
    });
    // Add disposables to subscriptions array
    context.subscriptions.push(csvCommand);
    context.subscriptions.push(excelCommand);
    context.subscriptions.push(clearCommand);
    // Refresh associated preview when a CSV file is saved
    vscode_1.workspace.onDidSaveTextDocument(document => {
        if (isCsvFile(document)) {
            let resource = document.uri;
            const uri = resource.with({
                scheme: 'csv-preview'
            });
            let preview = previewManager_1.previewManager.find(uri);
            if (preview) {
                preview.refresh();
            }
        }
    });
    // Refresh associated preview when a CSV file changes
    vscode_1.workspace.onDidChangeTextDocument(args => {
        if (isCsvFile(args.document)) {
            let resource = args.document.uri;
            let scheme = resource.scheme;
            const uri = resource.with({
                scheme: 'csv-preview'
            });
            let preview = previewManager_1.previewManager.find(uri);
            if (preview && args.contentChanges.length > 0) {
                preview.refresh();
            }
        }
    });
    // Reset all previews when the configuration changes
    vscode_1.workspace.onDidChangeConfiguration(() => {
        previewManager_1.previewManager.configure();
    });
    // Automatically preview content piped from stdin (when VSCode is already open)
    vscode_1.workspace.onDidOpenTextDocument(document => {
        if (isStdinFile(document)) {
            vscode_1.commands.executeCommand('csv.preview', document.uri);
        }
    });
    // Automaticlly preview content piped from stdin (when VSCode first starts up)
    if (vscode_1.window.activeTextEditor) {
        let document = vscode_1.window.activeTextEditor.document;
        if (isStdinFile(document)) {
            vscode_1.commands.executeCommand('csv.preview', document.uri);
        }
    }
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
function isCsvFile(document) {
    if (document) {
        let lang = document.languageId.toLowerCase();
        let allowed = ['csv', 'csv (semicolon)', 'csv (pipe)', 'tsv', 'plaintext'];
        return allowed.find(a => a === lang) && document.uri.scheme !== 'csv-preview';
    }
    return false;
}
function isStdinFile(document) {
    let allowed = vscode_1.workspace.getConfiguration('csv-preview').get("openStdin");
    return (allowed && document) ? path.basename(document.fileName).match("code-stdin-[^.]+.txt") : false;
}
function getViewColumn() {
    const active = vscode_1.window.activeTextEditor;
    return active ? active.viewColumn : vscode_1.ViewColumn.One;
}
//# sourceMappingURL=extension.js.map