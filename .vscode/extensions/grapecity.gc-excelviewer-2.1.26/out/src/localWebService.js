'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const http = require("http");
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cors = require('cors');
const fs = require('fs');
class LocalWebService {
    constructor(context) {
        this.app = express();
        this.server = http.createServer();
        this._content = "";
        this._htmlContentLocation = 'out/src/content';
        let self = this;
        // add static content for express web server to serve
        this._staticContentPath = path.join(context.extensionPath, this._htmlContentLocation);
        this.app.use(cors());
        this.app.use(express.static(this._staticContentPath));
        this.app.use(bodyParser.json());
        this.app.get('/state', function (req, res) {
            let storage = {
                content: self._content,
                options: self._options
            };
            res.send(storage);
        });
        this.app.post('/state', function (req, res) {
            context.workspaceState.update(self._options.uri, req.body);
            self._options.state = req.body;
            res.send(200);
        });
        this.app.get('/proxy', function (req, res) {
            let file = req.query.file;
            fs.readFile(file, (err, data) => {
                if (err) {
                    res.status(500).send(err.message);
                }
                else {
                    res.send(data);
                }
            });
        });
        this.server.on('request', this.app);
    }
    get serviceUrl() {
        return 'http://localhost:' + this._servicePort;
    }
    get content() {
        return this._content;
    }
    set content(value) {
        this._content = value;
    }
    get options() {
        return this._options;
    }
    set options(value) {
        this._options = value;
    }
    init(content, options) {
        this._content = content;
        this._options = options;
    }
    start() {
        const port = this.server.listen(0).address().port; // 0 = listen on a random port
        this._servicePort = port.toString();
    }
}
exports.default = LocalWebService;
//# sourceMappingURL=localWebService.js.map