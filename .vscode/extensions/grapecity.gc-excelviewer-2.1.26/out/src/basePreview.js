'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = require("path");
const localWebService_1 = require("./localWebService");
const previewManager_1 = require("./previewManager");
class BasePreview {
    constructor(context, uri, scheme, viewColumn) {
        this._disposables = [];
        this._storage = context.workspaceState;
        this._uri = uri;
        this.initWebview(scheme, viewColumn);
        this.initService(context);
    }
    initWebview(scheme, viewColumn) {
        let self = this;
        this._previewUri = this._uri.with({
            scheme: scheme
        });
        this._title = `Preview '${path.basename(this._uri.fsPath)}'`;
        this._panel = vscode_1.window.createWebviewPanel("gc-excelwebviewer", this._title, viewColumn, {
            enableScripts: true,
            enableCommandUris: true,
            enableFindWidget: true
        });
        this._panel.onDidDispose(() => {
            this.dispose();
        }, null, this._disposables);
        this._panel.onDidChangeViewState((e) => {
            //self._isActive = e.webviewPanel.visible;
            let active = e.webviewPanel.visible;
        }, null, this._disposables);
        this.webview.onDidReceiveMessage((e) => {
            if (e.error) {
                vscode_1.window.showErrorMessage(e.error);
            }
        }, null, this._disposables);
        previewManager_1.previewManager.add(this);
    }
    getLocalResourceRoots() {
        const folder = vscode_1.workspace.getWorkspaceFolder(this.uri);
        if (folder) {
            return [folder.uri];
        }
        if (!this.uri.scheme || this.uri.scheme === 'file') {
            return [vscode_1.Uri.file(path.dirname(this.uri.fsPath))];
        }
        return [];
    }
    initService(context) {
        this._service = new localWebService_1.default(context);
        this._service.start();
    }
    update(content, options) {
        this._service.init(content, options);
        this.webview.html = this.html;
    }
    getOptions() {
        return {
            uri: this.previewUri.toString(),
            state: this.state
        };
    }
    configure() {
        let options = this.getOptions();
        this.service.options = options;
        this.webview.html = this.html;
        this.refresh();
    }
    dispose() {
        previewManager_1.previewManager.remove(this);
        this._panel.dispose();
        while (this._disposables.length) {
            const item = this._disposables.pop();
            if (item) {
                item.dispose();
            }
        }
    }
    get visible() {
        return this._panel.visible;
    }
    get webview() {
        return this._panel.webview;
    }
    get storage() {
        return this._storage;
    }
    get state() {
        return this.storage.get(this.previewUri.toString());
    }
    get theme() {
        return vscode_1.workspace.getConfiguration('csv-preview').get("theme");
    }
    get uri() {
        return this._uri;
    }
    get previewUri() {
        return this._previewUri;
    }
    get serviceUrl() {
        return this._service.serviceUrl;
    }
    get service() {
        return this._service;
    }
}
exports.default = BasePreview;
//# sourceMappingURL=basePreview.js.map