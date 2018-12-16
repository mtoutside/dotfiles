'use strict';
var vscode = require('vscode');
var path = require('path');
var vscode_1 = require('vscode');
function activate(context) {
    var previewUri = vscode_1.Uri.parse('glsl-preview://authority/glsl-preview');
    var provider = new GLSLDocumentContentProvider(context);
    var registration = vscode.workspace.registerTextDocumentContentProvider('glsl-preview', provider);
    var config = vscode.workspace.getConfiguration('shader-toy');
    var _timeout;
    var editor = vscode.window.activeTextEditor;
    if (config.get('reloadOnEditText')) {
        vscode.workspace.onDidChangeTextDocument(function (e) {
            clearTimeout(_timeout);
            _timeout = setTimeout(function () {
                if (vscode.window.activeTextEditor && e && e.document === vscode.window.activeTextEditor.document) {
                    provider.update(previewUri);
                }
            }, config.get('reloadOnEditTextDelay') * 1000);
        });
    }
    if (config.get('reloadOnChangeEditor')) {
        vscode.window.onDidChangeActiveTextEditor(function (e) {
            if (e && e.document === e.document) {
                provider.update(previewUri);
                editor = e;
            }
        });
    }
    var previewCommand = vscode.commands.registerCommand('shader-toy.showGlslPreview', function () {
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode_1.ViewColumn.Two, 'GLSL Preview')
            .then(function (success) { }, function (reason) { vscode.window.showErrorMessage(reason); });
    });
    var errorCommand = vscode.commands.registerCommand('shader-toy.onGlslError', function (line, file) {
        var highlightLine = function (document, line) {
            var range = document.lineAt(line - 1).range;
            vscode.window.showTextDocument(document, vscode.ViewColumn.One, true);
            editor.selection = new vscode.Selection(range.start, range.end);
            editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        };
        if (editor) {
            var currentFile = editor.document.fileName;
            currentFile = currentFile.replace(/\\/g, '/');
            if (currentFile == file) {
                highlightLine(editor.document, line);
                return;
            }
        }
        var newDocument = vscode.workspace.openTextDocument(file);
        newDocument.then(function (document) {
            highlightLine(document, line);
        }, function (reason) {
            vscode.window.showErrorMessage("Could not open " + file + " because " + reason);
        });
    });
    context.subscriptions.push(previewCommand, registration);
    context.subscriptions.push(errorCommand);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
var GLSLDocumentContentProvider = (function () {
    function GLSLDocumentContentProvider(context) {
        this._onDidChange = new vscode_1.EventEmitter();
        this._context = context;
    }
    GLSLDocumentContentProvider.prototype.getResourcePath = function (mediaFile) {
        var resourcePath = this._context.asAbsolutePath(path.join('resources', mediaFile));
        resourcePath = resourcePath.replace(/\\/g, '/');
        return resourcePath;
    };
    GLSLDocumentContentProvider.prototype.provideTextDocumentContent = function (uri) {
        var activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage("Select a TextEditor to show GLSL Preview.");
            return "";
        }
        var shader = activeEditor.document.getText();
        var shaderName = activeEditor.document.fileName;
        var config = vscode.workspace.getConfiguration('shader-toy');
        var shaderPreamble = "\n        uniform vec3        iResolution;\n        uniform float       iGlobalTime;\n        uniform float       iTime;\n        uniform float       iTimeDelta;\n        uniform int         iFrame;\n        uniform float       iChannelTime[4];\n        uniform vec3        iChannelResolution[4];\n        uniform vec4        iMouse;\n        uniform sampler2D   iChannel0;\n        uniform sampler2D   iChannel1;\n        uniform sampler2D   iChannel2;\n        uniform sampler2D   iChannel3;\n        uniform sampler2D   iChannel4;\n        uniform sampler2D   iChannel5;\n        uniform sampler2D   iChannel6;\n        uniform sampler2D   iChannel7;\n        uniform sampler2D   iChannel8;\n        uniform sampler2D   iChannel9;\n        uniform sampler2D   iKeyboard;\n\n        #define SHADER_TOY";
        shaderName = shaderName.replace(/\\/g, '/');
        var buffers = [];
        var commonIncludes = [];
        this.parseShaderCode(shaderName, shader, buffers, commonIncludes);
        // If final buffer uses feedback we need to add a last pass that renders it to the screen
        // because we can not ping-pong the screen
        {
            var finalBuffer = buffers[buffers.length - 1];
            if (finalBuffer.UsesSelf) {
                var finalBufferIndex = buffers.length - 1;
                finalBuffer.Dependents.push({
                    Index: buffers.length,
                    Channel: 0
                });
                buffers.push({
                    Name: "final-blit",
                    File: "final-blit",
                    Code: "void main() { gl_FragColor = texture2D(iChannel0, gl_FragCoord.xy / iResolution.xy); }",
                    Textures: [{
                            Channel: 0,
                            Buffer: finalBuffer.Name,
                            BufferIndex: finalBufferIndex,
                            LocalTexture: null,
                            RemoteTexture: null,
                            UsesSelf: false
                        }],
                    UsesSelf: false,
                    SelfChannel: -1,
                    Dependents: [],
                    LineOffset: 0,
                });
            }
        }
        var useKeyboard = false;
        for (var _i = 0, buffers_1 = buffers; _i < buffers_1.length; _i++) {
            var buffer = buffers_1[_i];
            if (buffer.UsesKeyboard) {
                useKeyboard = true;
            }
        }
        var keyboard = {
            Init: "",
            Update: "",
            Callbacks: "",
            Shader: "",
            LineOffset: 0
        };
        if (useKeyboard) {
            keyboard.Init = "\n            const numKeys = 256;\n            const numStates = 4;\n            var keyBoardData = new Uint8Array(numKeys * numStates);\n            var keyBoardTexture = new THREE.DataTexture(keyBoardData, numKeys, numStates, THREE.LuminanceFormat, THREE.UnsignedByteType);\n            keyBoardTexture.magFilter = THREE.NearestFilter;\n            keyBoardTexture.needsUpdate = true;\n            var pressedKeys = [];\n            var releasedKeys = [];";
            keyboard.Update = "\n            // Update keyboard data\n            if (pressedKeys.length > 0 || releasedKeys.length > 0) {\n                for (let key of pressedKeys)\n                    keyBoardData[key + 256] = 0;\n                for (let key of releasedKeys)\n                    keyBoardData[key + 768] = 0;\n                keyBoardTexture.needsUpdate = true;\n                pressedKeys = [];\n                releasedKeys = [];\n            }";
            keyboard.Callbacks = "\n            document.addEventListener('keydown', function(evt) {\n                const i = evt.keyCode;\n                if (i >= 0 && i <= 255) {\n                    // Key is being held, don't register input\n                    if (keyBoardData[i] == 0) {\n                        keyBoardData[i] = 255; // Held\n                        keyBoardData[i + 256] = 255; // Pressed\n                        keyBoardData[i + 512] = (keyBoardData[i + 512] == 255 ? 0 : 255); // Toggled\n                        pressedKeys.push(i);\n                        keyBoardTexture.needsUpdate = true;\n                    }\n                }\n            });\n            document.addEventListener('keyup', function(evt) {\n                const i = evt.keyCode;\n                if (i >= 0 && i <= 255) {\n                    keyBoardData[i] = 0; // Not held\n                    keyBoardData[i + 768] = 255; // Released\n                    releasedKeys.push(i);\n                    keyBoardTexture.needsUpdate = true;\n                }\n            });";
            keyboard.Shader = "\n            const int Key_Backspace = 8, Key_Tab = 9, Key_Enter = 13, Key_Shift = 16, Key_Ctrl = 17, Key_Alt = 18, Key_Pause = 19, Key_Caps = 20, Key_Escape = 27, Key_PageUp = 33, Key_PageDown = 34, Key_End = 35,\n                Key_Home = 36, Key_LeftArrow = 37, Key_UpArrow = 38, Key_RightArrow = 39, Key_DownArrow = 40, Key_Insert = 45, Key_Delete = 46, Key_0 = 48, Key_1 = 49, Key_2 = 50, Key_3 = 51, Key_4 = 52,\n                Key_5 = 53, Key_6 = 54, Key_7 = 55, Key_8 = 56, Key_9 = 57, Key_A = 65, Key_B = 66, Key_C = 67, Key_D = 68, Key_E = 69, Key_F = 70, Key_G = 71, Key_H = 72,\n                Key_I = 73, Key_J = 74, Key_K = 75, Key_L = 76, Key_M = 77, Key_N = 78, Key_O = 79, Key_P = 80, Key_Q = 81, Key_R = 82, Key_S = 83, Key_T = 84, Key_U = 85,\n                Key_V = 86, Key_W = 87, Key_X = 88, Key_Y = 89, Key_Z = 90, Key_LeftWindow = 91, Key_RightWindows = 92, Key_Select = 93, Key_Numpad0 = 96, Key_Numpad1 = 97, Key_Numpad2 = 98, Key_Numpad3 = 99,\n                Key_Numpad4 = 100, Key_Numpad5 = 101, Key_Numpad6 = 102, Key_Numpad7 = 103, Key_Numpad8 = 104, Key_Numpad9 = 105, Key_NumpadMultiply = 106, Key_NumpadAdd = 107, Key_NumpadSubtract = 109, Key_NumpadPeriod = 110, Key_NumpadDivide = 111, Key_F1 = 112, Key_F2 = 113, Key_F3 = 114, Key_F4 = 115, Key_F5 = 116, Key_F6 = 117, Key_F7 = 118, Key_F8 = 119, Key_F9 = 120, Key_F10 = 121, Key_F11 = 122, Key_F12 = 123, Key_NumLock = 144, Key_ScrollLock = 145,\n                Key_SemiColon = 186, Key_Equal = 187, Key_Comma = 188, Key_Dash = 189, Key_Period = 190, Key_ForwardSlash = 191, Key_GraveAccent = 192, Key_OpenBracket = 219, Key_BackSlash = 220, Key_CloseBraket = 221, Key_SingleQuote = 222;\n\n            bool isKeyDown(int key) {\n                vec2 uv = vec2(float(key) / 255.0, 0.125);\n                return texture2D(iKeyboard, uv).r > 0.0;\n            }\n            bool isKeyPressed(int key) {\n                vec2 uv = vec2(float(key) / 255.0, 0.375);\n                return texture2D(iKeyboard, uv).r > 0.0;\n            }\n            bool isKeyToggled(int key) {\n                vec2 uv = vec2(float(key) / 255.0, 0.625);\n                return texture2D(iKeyboard, uv).r > 0.0;\n            }\n            bool isKeyReleased(int key) {\n                vec2 uv = vec2(float(key) / 255.0, 0.875);\n                return texture2D(iKeyboard, uv).r > 0.0;\n            }";
            keyboard.LineOffset = keyboard.Shader.split(/\r\n|\n/).length - 1;
        }
        // Write all the shaders
        var shaderScripts = "";
        var buffersScripts = "";
        var _loop_1 = function(buffer) {
            var include = buffer.IncludeName ? commonIncludes.find(function (include) { return include.Name == buffer.IncludeName; }) : '';
            shaderScripts += "\n            <script id=\"" + buffer.Name + "\" type=\"x-shader/x-fragment\">\n                " + shaderPreamble + "\n                " + keyboard.Shader + "\n                " + (include ? include.Code : '') + "\n                " + buffer.Code + "\n            </script>";
            // Create a RenderTarget for all but the final buffer
            target = "null";
            pingPongTarget = "null";
            if (buffer != buffers[buffers.length - 1])
                target = "new THREE.WebGLRenderTarget(canvas.clientWidth, canvas.clientHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: framebufferType })";
            if (buffer.UsesSelf)
                pingPongTarget = "new THREE.WebGLRenderTarget(canvas.clientWidth, canvas.clientHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: framebufferType })";
            if (buffer.UsesKeyboard)
                buffer.LineOffset += keyboard.LineOffset;
            buffersScripts += "\n            buffers.push({\n                Name: \"" + buffer.Name + "\",\n                File: \"" + buffer.File + "\",\n                LineOffset: " + buffer.LineOffset + ",\n                Target: " + target + ",\n                PingPongTarget: " + pingPongTarget + ",\n                PingPongChannel: " + buffer.SelfChannel + ",\n                Dependents: " + JSON.stringify(buffer.Dependents) + ",\n                Shader: new THREE.ShaderMaterial({\n                    fragmentShader: document.getElementById('" + buffer.Name + "').textContent,\n                    depthWrite: false,\n                    depthTest: false,\n                    uniforms: {\n                        iResolution: { type: \"v3\", value: resolution },\n                        iGlobalTime: { type: \"f\", value: 0.0 },\n                        iTime: { type: \"f\", value: 0.0 },\n                        iTimeDelta: { type: \"f\", value: 0.0 },\n                        iFrame: { type: \"i\", value: 0 },\n                        iMouse: { type: \"v4\", value: mouse },\n\n                        resolution: { type: \"v2\", value: resolution },\n                        time: { type: \"f\", value: 0.0 },\n                        mouse: { type: \"v2\", value: normalizedMouse },\n                    }\n                })\n            });";
        };
        var target, pingPongTarget;
        for (var _a = 0, buffers_2 = buffers; _a < buffers_2.length; _a++) {
            var buffer = buffers_2[_a];
            _loop_1(buffer);
        }
        // add the common includes for compilation checking
        for (var _b = 0, commonIncludes_1 = commonIncludes; _b < commonIncludes_1.length; _b++) {
            var include = commonIncludes_1[_b];
            shaderScripts += "\n                <script id=\"" + include.Name + "\" type=\"x-shader/x-fragment\">#version 300 es\n                    precision highp float;\n                    " + shaderPreamble + "\n                    " + include.Code + "\n                    void main() {}\n                </script>";
            buffersScripts += "\n                commonIncludes.push({\n                    Name: \"" + include.Name + "\",\n                    File: \"" + include.File + "\"\n                });";
        }
        var textureScripts = "\n";
        var textureLoadScript = "function(texture) {\n            texture.minFilter = THREE.LinearFilter;\n            texture.wrapS = THREE.RepeatWrapping;\n            texture.wrapT = THREE.RepeatWrapping;\n        }";
        for (var i in buffers) {
            var buffer = buffers[i];
            var textures = buffer.Textures;
            for (var _c = 0, textures_1 = textures; _c < textures_1.length; _c++) {
                var texture = textures_1[_c];
                var channel = texture.Channel;
                var bufferIndex = texture.BufferIndex;
                var texturePath = texture.LocalTexture;
                var textureUrl = texture.RemoteTexture;
                var value = void 0;
                if (bufferIndex != null)
                    value = "buffers[" + bufferIndex + "].Target.texture";
                else if (texturePath != null)
                    value = "texLoader.load('file://" + texturePath + "', " + textureLoadScript + ")";
                else
                    value = "texLoader.load('https://" + textureUrl + "', " + textureLoadScript + ")";
                textureScripts += "buffers[" + i + "].Shader.uniforms.iChannel" + channel + " = { type: 't', value: " + value + " };\n";
            }
            if (buffer.UsesSelf) {
                textureScripts += "buffers[" + i + "].Shader.uniforms.iChannel" + buffer.SelfChannel + " = { type: 't', value: buffers[" + i + "].PingPongTarget.texture };\n";
            }
            if (buffer.UsesKeyboard) {
                useKeyboard = true;
                textureScripts += "buffers[" + i + "].Shader.uniforms.iKeyboard = { type: 't', value: keyBoardTexture };\n";
            }
        }
        var frameTimeScript = "";
        if (config.get('printShaderFrameTime')) {
            frameTimeScript = "\n            <script src=\"file://" + this.getResourcePath('stats.min.js') + "\" onload=\"\n                var stats = new Stats();\n                stats.showPanel(1);\n                document.body.appendChild(stats.dom);\n                requestAnimationFrame(function loop() {\n                    stats.update();\n                    requestAnimationFrame(loop);\n                });\n            \"></script>";
        }
        var pauseButtonScript = "";
        if (config.get('showPauseButton')) {
            pauseButtonScript = "\n            <label class=\"button-container\">\n                <input id=\"pause-button\" type=\"checkbox\">\n                <span class=\"pause-play\"></span>\n            </div>";
        }
        var pauseWholeScript = "";
        var advanceTimeScript = "\n        deltaTime = clock.getDelta();\n        time = clock.getElapsedTime() - pausedTime;";
        if (config.get('pauseWholeRender')) {
            pauseWholeScript = "if (paused) return;";
        }
        else {
            advanceTimeScript = "\n            if (paused == false) {\n                deltaTime = clock.getDelta();\n                time = clock.getElapsedTime() - pausedTime;\n            } else {\n                deltaTime = 0.0;\n            }";
        }
        // http://threejs.org/docs/api/renderers/webgl/WebGLProgram.html
        var content = "\n            <head>\n                <style>\n                    html, body, #canvas {\n                        margin: 0;\n                        padding: 0;\n                        width: 100%;\n                        height: 100%;\n                        display: block;\n                    }\n                    \n                    .error {\n                        font-family: Consolas;\n                        font-size: 1.2em;\n                        color: black;\n                        box-sizing: border-box;\n                        background-color: lightcoral;\n                        border-radius: 2px;\n                        border-color: lightblue;\n                        border-width: thin;\n                        border-style: solid;\n                        line-height: 1.4em;\n                    }\n                    .error:hover {\n                        color: black;\n                        background-color: brown;\n                        border-color: blue;\n                    }\n                    #message {\n                        font-family: Consolas;\n                        font-size: 1.2em;\n                        color: #ccc;\n                        background-color: black;\n                        font-weight: bold;\n                        z-index: 2;\n                        position: absolute;\n                    }\n                    \n                    /* Container for pause button */\n                    .button-container, .container {\n                        text-align: center;\n                        position: absolute;\n                        bottom: 0;\n                        width: 100%;\n                        height: 80px;\n                        margin: auto;\n                    }\n                    /* Hide the browser's default checkbox */\n                    .button-container input {\n                        position: absolute;\n                        opacity: 0;\n                        cursor: pointer;\n                    }\n            \n                    /* Custom checkmark style */\n                    .pause-play {\n                        position: absolute;\n                        border: none;\n                        padding: 30px;\n                        text-align: center;\n                        text-decoration: none;\n                        font-size: 16px;\n                        border-radius: 8px;\n                        margin: auto;\n                        transform: translateX(-50%);\n                        background: url(\"file://" + this.getResourcePath('pause.png') + "\");\n                        background-size: 40px;\n                        background-repeat: no-repeat;\n                        background-position: center;\n                        background-color: rgba(128, 128, 128, 0.5);\n                    }\n                    .button-container:hover input ~ .pause-play {\n                        background-color: lightgray;\n                        transition-duration: 0.2s;\n                    }\n                    .button-container:hover input:checked ~ .pause-play {\n                        background-color: lightgray;\n                        transition-duration: 0.2s;\n                    }\n                    .button-container input:checked ~ .pause-play {\n                        background: url(\"file://" + this.getResourcePath('play.png') + "\");\n                        background-size: 40px;\n                        background-repeat: no-repeat;\n                        background-position: center;\n                        background-color: rgba(128, 128, 128, 0.5);\n                    }\n                </style>\n            </head>\n            <body>\n                <div id=\"message\"></div>\n                <div id=\"container\">\n                    " + pauseButtonScript + "\n                </div>\n            </body>\n            <script src=\"file://" + this.getResourcePath('jquery.min.js') + "\"></script>\n            <script src=\"file://" + this.getResourcePath('three.min.js') + "\"></script>\n            " + frameTimeScript + "\n            <canvas id=\"canvas\"></canvas>\n\n            " + shaderScripts + "\n\n            <script type=\"text/javascript\">\n                var currentShader = {};\n                (function(){\n                    console.error = function (message) {\n                        if('7' in arguments) {\n                            $(\"#message\").append('<h3>Shader failed to compile - ' + currentShader.Name + '</h3><ul>');\n                            $(\"#message\").append(arguments[7].replace(/ERROR: \\d+:(\\d+)/g, function(m, c) {\n                                let lineNumber = Number(c) - currentShader.LineOffset;\n                                return '<li><a class=\"error\" unselectable href=\"'+ encodeURI('command:shader-toy.onGlslError?' + JSON.stringify([lineNumber, currentShader.File])) + '\">Line ' + String(lineNumber) + '</a>';\n                            }));\n                            $(\"#message\").append('</ul>');\n                        }\n                    };\n                })();\n                // Development feature: Output warnings from third-party libraries\n                // (function(){\n                //     console.warn = function (message) {\n                //         $(\"#message\").append(message + '<br>');\n                //     };\n                // })();\n\n                var clock = new THREE.Clock();\n                var pausedTime = 0.0;\n                var deltaTime = 0.0;\n                var time = 0.0;\n\n                var paused = false;\n                var pauseButton = document.getElementById('pause-button');\n                if (pauseButton) {\n                    pauseButton.onclick = function(){\n                        paused = pauseButton.checked;\n                        if (!paused)\n                            pausedTime += clock.getDelta();\n                    };\n                }\n\n                var canvas = document.getElementById('canvas');\n                var gl = canvas.getContext('webgl2');\n                var isWebGL2 = gl != null;\n                if (gl == null) gl = canvas.getContext('webgl');\n                var supportsFloatFramebuffer = (gl.getExtension('EXT_color_buffer_float') != null) || (gl.getExtension('WEBGL_color_buffer_float') != null);\n                var supportsHalfFloatFramebuffer = (gl.getExtension('EXT_color_buffer_half_float') != null);\n                var framebufferType = THREE.UnsignedByteType;\n                if (supportsFloatFramebuffer) framebufferType = THREE.FloatType;\n                else if (supportsHalfFloatFramebuffer) framebufferType = THREE.HalfFloatType;\n\n                var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, context: gl });\n                var resolution = new THREE.Vector3(canvas.clientWidth, canvas.clientHeight, 1.0);\n                var mouse = new THREE.Vector4(0, 0, 0, 0);\n                var normalizedMouse = new THREE.Vector2(0, 0);\n                var frameCounter = 0;\n\n                var channelResolution = new THREE.Vector3(128.0, 128.0, 0.0);\n\n                var buffers = [];\n                var commonIncludes = [];\n                " + buffersScripts + "\n\n                // WebGL2 inserts more lines into the shader\n                if (isWebGL2) {\n                    for (let buffer of buffers) {\n                        buffer.LineOffset += 16;\n                    }\n                }\n\n                " + keyboard.Init + "\n                \n                var texLoader = new THREE.TextureLoader();\n                " + textureScripts + "\n                \n                var scene = new THREE.Scene();\n                var quad = new THREE.Mesh(\n                    new THREE.PlaneGeometry(resolution.x, resolution.y),\n                    null\n                );\n                scene.add(quad);\n                \n                var camera = new THREE.OrthographicCamera(-resolution.x / 2.0, resolution.x / 2.0, resolution.y / 2.0, -resolution.y / 2.0, 1, 1000);\n                camera.position.set(0, 0, 10);\n\n                // Run every shader once to check for compile errors\n                let failed=0;\n                for (let include of commonIncludes) {\n                    currentShader = {\n                        Name: include.Name,\n                        File: include.File,\n                        LineOffset: " + shaderPreamble.split(/\r\n|\n/).length + "  + 2 // add two for version and precision lines\n                    };\n                    // bail if there is an error found in the include script\n                    if(compileFragShader(gl, document.getElementById(include.Name).textContent) == false) throw Error(`Failed to compile ${include.Name}`);\n                }\n\n                for (let buffer of buffers) {\n                    currentShader = {\n                        Name: buffer.Name,\n                        File: buffer.File,\n                        LineOffset: buffer.LineOffset\n                    };\n                    quad.material = buffer.Shader;\n                    renderer.render(scene, camera, buffer.Target);\n                }\n                currentShader = {};\n\n                render();\n\n                function addLineNumbers( string ) {\n                    var lines = string.split( '\\n' );\n                    for ( var i = 0; i < lines.length; i ++ ) {\n                        lines[ i ] = ( i + 1 ) + ': ' + lines[ i ];\n                    }\n                    return lines.join( '\\n' );\n                }\n            \n                function compileFragShader(gl, fsSource) {\n                    const fs = gl.createShader(gl.FRAGMENT_SHADER);\n                    gl.shaderSource(fs, fsSource);\n                    gl.compileShader(fs);\n                    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {\n                        const fragmentLog = gl.getShaderInfoLog(fs);\n                        console.error( 'THREE.WebGLProgram: shader error: ', gl.getError(), 'gl.COMPILE_STATUS', null, null, null, null, fragmentLog );\n                        return false;\n                    }\n                    return true;\n                }\n\n                function render() {\n                    requestAnimationFrame(render);\n                    " + pauseWholeScript + "\n            \n                    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {\n                        resolution.x = canvas.clientWidth;\n                        resolution.y = canvas.clientHeight;\n                        for (let buffer of buffers) {\n                            if (buffer.Target) {\n                                buffer.Target.setSize(resolution.x, resolution.y);\n                            }\n                            if (buffer.PingPongTarget) {\n                                buffer.PingPongTarget.setSize(resolution.x, resolution.y);\n                            }\n                        }\n                        renderer.setSize(resolution.x, resolution.y, false);\n                        \n                        // Update Camera and Mesh\n                        quad.geometry = new THREE.PlaneGeometry(resolution.x, resolution.y);\n                        camera.left = -resolution.x / 2.0;\n                        camera.right = resolution.x / 2.0;\n                        camera.top = resolution.y / 2.0;\n                        camera.bottom = -resolution.y / 2.0;\n                        camera.updateProjectionMatrix();\n\n                        // Reset iFrame on resize for shaders that rely on first-frame setups\n                        frameCounter = 0;\n                    }\n                    \n                    frameCounter++;\n                    " + advanceTimeScript + "\n\n                    for (let buffer of buffers) {\n                        buffer.Shader.uniforms['iResolution'].value = resolution;\n                        buffer.Shader.uniforms['iTimeDelta'].value = deltaTime;\n                        buffer.Shader.uniforms['iGlobalTime'].value = time;\n                        buffer.Shader.uniforms['iTime'].value = time;\n                        buffer.Shader.uniforms['iFrame'].value = frameCounter;\n                        buffer.Shader.uniforms['iMouse'].value = mouse;\n\n                        buffer.Shader.uniforms['resolution'].value = resolution;\n                        buffer.Shader.uniforms['time'].value = time;\n                        buffer.Shader.uniforms['mouse'].value = normalizedMouse;\n\n                        quad.material = buffer.Shader;\n                        renderer.render(scene, camera, buffer.Target);\n                    }\n\n                    for (let buffer of buffers) {\n                        if (buffer.PingPongTarget) {\n                            [buffer.PingPongTarget, buffer.Target] = [buffer.Target, buffer.PingPongTarget];\n                            buffer.Shader.uniforms[`iChannel${buffer.PingPongChannel}`].value = buffer.PingPongTarget.texture;\n                            for (let dependent of buffer.Dependents) {\n                                const dependentBuffer = buffers[dependent.Index];\n                                dependentBuffer.Shader.uniforms[`iChannel${dependent.Channel}`] = { type: 't', value: buffer.Target.texture };\n                            }\n                        }\n                    }\n\n                    " + keyboard.Update + "\n                }\n                let dragging = false;\n                function updateMouse(clientX, clientY) {\n                    var rect = canvas.getBoundingClientRect();\n                    var mouseX = clientX - rect.left;\n                    var mouseY = resolution.y - clientY - rect.top;\n\n                    if (mouse.z + mouse.w != 0) {\n                        mouse.x = mouseX;\n                        mouse.y = mouseY;\n                    }\n\n                    normalizedMouse.x = mouseX / resolution.x;\n                    normalizedMouse.y = mouseY / resolution.y;\n                }\n                canvas.addEventListener('mousemove', function(evt) {\n                    updateMouse(evt.clientX, evt.clientY);\n                }, false);\n                canvas.addEventListener('mousedown', function(evt) {\n                    if (evt.button == 0)\n                        mouse.z = 1;\n                    if (evt.button == 2)\n                        mouse.w = 1;\n\n                    if (!dragging) {\n                        updateMouse(evt.clientX, evt.clientY);\n                        dragging = true\n                    }\n                }, false);\n                canvas.addEventListener('mouseup', function(evt) {\n                    if (evt.button == 0)\n                        mouse.z = 0;\n                    if (evt.button == 2)\n                        mouse.w = 0;\n\n                    dragging = false;\n                }, false);\n\n                " + keyboard.Callbacks + "\n            </script>\n        ";
        // console.log(shaderScripts);
        // require("fs").writeFileSync(__dirname + "../../src/preview.html", content);
        return content;
    };
    Object.defineProperty(GLSLDocumentContentProvider.prototype, "onDidChange", {
        get: function () {
            return this._onDidChange.event;
        },
        enumerable: true,
        configurable: true
    });
    GLSLDocumentContentProvider.prototype.update = function (uri) {
        this._onDidChange.fire(uri);
    };
    GLSLDocumentContentProvider.prototype.readShaderFile = function (file) {
        // Read the whole file of the shader
        var success = false;
        var bufferCode = "";
        var error = null;
        var fs = require("fs");
        try {
            bufferCode = fs.readFileSync(file, "utf-8");
            success = true;
        }
        catch (e) {
            error = e;
        }
        return { success: success, error: error, bufferCode: bufferCode };
    };
    GLSLDocumentContentProvider.prototype.parseShaderCode = function (name, code, buffers, commonIncludes) {
        var _this = this;
        var stripPath = function (name) {
            var lastSlash = name.lastIndexOf('/');
            return name.substring(lastSlash + 1);
        };
        var findByName = function (bufferName) {
            return function (value) {
                if (value.Name == stripPath(bufferName))
                    return true;
                return false;
            };
        };
        var found = buffers.find(findByName(name));
        if (found != undefined)
            return;
        var config = vscode.workspace.getConfiguration('shader-toy');
        var line_offset = 124;
        var textures = [];
        var includeName = '';
        var loadDependency = function (file, channel, passType) {
            // Get type and name of file
            var colonPos = file.indexOf('://', 0);
            var textureType = file.substring(0, colonPos);
            // Fix path to use '/' over '\\' and relative to the current working directory
            file = file.substring(colonPos + 3, file.length);
            var origFile = file;
            file = (function (file) {
                var relFile = vscode.workspace.asRelativePath(file);
                var herePos = relFile.indexOf("./");
                if (vscode.workspace.rootPath == null && herePos == 0)
                    vscode.window.showErrorMessage("To use relative paths please open a workspace!");
                if (relFile != file || herePos == 0)
                    return vscode.workspace.rootPath + '/' + relFile;
                else
                    return file;
            })(file);
            file = file.replace(/\\/g, '/');
            file = file.replace(/\.\//g, "");
            if (passType == "include" && textureType == "glsl") {
                var path_1 = require("path");
                var name_1 = path_1.basename(file);
                // Attempt to get the include if already exists
                var include = commonIncludes.find(function (include) { return include.File === file; });
                if (!include) {
                    // Read the whole file of the shader
                    var shaderFile = _this.readShaderFile(file);
                    if (shaderFile.success == false) {
                        vscode.window.showErrorMessage("Could not open file: " + origFile);
                        return;
                    }
                    include = {
                        Name: name_1,
                        File: file,
                        Code: shaderFile.bufferCode,
                        LineCount: shaderFile.bufferCode.split(/\r\n|\n/).length
                    };
                    commonIncludes.push(include);
                }
                // offset the include line count
                // TODO: Why do we need to subtract one here?
                line_offset += include.LineCount - 1;
                // store the reference name for this include
                includeName = name_1;
            }
            else if (textureType == "buf") {
                if (file == "self") {
                    // Push self as feedback-buffer
                    textures.push({
                        Channel: channel,
                        Buffer: null,
                        LocalTexture: null,
                        RemoteTexture: null,
                        Self: true
                    });
                }
                else {
                    // Read the whole file of the shader
                    var shaderFile = _this.readShaderFile(file);
                    if (shaderFile.success == false) {
                        vscode.window.showErrorMessage("Could not open file: " + origFile);
                        return;
                    }
                    // Parse the shader
                    _this.parseShaderCode(file, shaderFile.bufferCode, buffers, commonIncludes);
                    // Push buffers as textures
                    textures.push({
                        Channel: channel,
                        Buffer: stripPath(file),
                        LocalTexture: null,
                        RemoteTexture: null,
                        Self: false
                    });
                }
            }
            else if (textureType == "file") {
                // Push texture
                textures.push({
                    Channel: channel,
                    Buffer: null,
                    LocalTexture: file,
                    RemoteTexture: null,
                    Self: false
                });
            }
            else {
                textures.push({
                    Channel: channel,
                    Buffer: null,
                    LocalTexture: null,
                    RemoteTexture: file,
                    Self: false
                });
            }
        };
        var usesKeyboard = false;
        var useTextureDefinitionInShaders = config.get('useInShaderTextures');
        if (useTextureDefinitionInShaders) {
            // Find all #iChannel defines, which define textures and other shaders
            var channelMatch, texturePos, matchLength, passType;
            var findNextMatch = function () {
                channelMatch = code.match(/^\s*#(iChannel|include|iKeyboard)/m);
                texturePos = channelMatch ? channelMatch.index : -1;
                matchLength = channelMatch ? channelMatch[0].length : 0;
                passType = channelMatch && channelMatch[1];
            };
            findNextMatch();
            while (texturePos >= 0) {
                // Get channel number
                var channelPos = texturePos + matchLength;
                var endline = code.substring(channelPos).match(/\r\n|\r|\n/);
                endline.index += channelPos;
                var spacePos = Math.min(code.indexOf(" ", texturePos + matchLength), endline.index);
                if (passType == "iKeyboard") {
                    usesKeyboard = true;
                }
                else {
                    var channel = parseInt(code.substring(channelPos, spacePos));
                    var afterSpacePos = code.indexOf(" ", spacePos + 1);
                    var afterCommentPos = code.indexOf("//", code.indexOf("://", spacePos) + 3);
                    var textureEndPos = Math.min(endline.index, afterSpacePos > 0 ? afterSpacePos : code.length, afterCommentPos > 0 ? afterCommentPos : code.length);
                    // Get dependencies' name
                    var texture = code.substring(spacePos + 1, textureEndPos);
                    // Load the dependency
                    loadDependency(texture, channel, passType);
                }
                // Remove #iChannel define
                code = code.replace(code.substring(texturePos, endline.index + endline[0].length), "");
                findNextMatch();
                line_offset--;
            }
        }
        else {
            var textures_2 = config.get('textures');
            for (var i in textures_2) {
                var texture = textures_2[i];
                if (textures_2[i].length > 0) {
                    // Check for buffer to load to avoid circular loading
                    if (stripPath(texture) != stripPath(name)) {
                        loadDependency(texture, parseInt(i), "iChannel");
                    }
                }
            }
        }
        // If there is no void main() in the shader we assume it is a shader-toy style shader
        var mainPos = code.search(/void\s+main\s*\(\s*\)\s*\{/g);
        var mainImagePos = code.search(/void\s+mainImage\s*\(\s*out\s+vec4\s+\w+,\s*in\s+vec2\s+\w+\s*\)\s*\{/g);
        if (mainPos == -1 && mainImagePos >= 0) {
            code += "\n            void main() {\n                mainImage(gl_FragColor, gl_FragCoord.xy);\n            }\n            ";
        }
        var definedTextures = {};
        for (var _i = 0, textures_3 = textures; _i < textures_3.length; _i++) {
            var texture = textures_3[_i];
            definedTextures[texture.Channel] = true;
        }
        if (config.get('warnOnUndefinedTextures')) {
            var _loop_2 = function(i) {
                if (code.search("iChannel" + i) > 0) {
                    if (definedTextures[i] == null) {
                        if (useTextureDefinitionInShaders) {
                            vscode.window.showWarningMessage("iChannel" + i + " in use but there is no definition #iChannel" + i + " in shader", "Details")
                                .then(function (option) {
                                vscode.window.showInformationMessage("To use this channel add to your shader a line \"#iChannel" + i + "\" followed by a space and the path to your texture. Use \"file://\" for local textures, \"https://\" for remote textures or \"buf://\" for other shaders.");
                            });
                        }
                        else {
                            vscode.window.showWarningMessage("iChannel" + i + " in use but there is no definition \"" + i + "\" in settings.json", "Details")
                                .then(function (option) {
                                vscode.window.showInformationMessage("To use this channel you will need to open your \"settings.json\" file and set the option \"shader-toy.textures." + i + "\" to the path to your texture. Use \"file://\" for local textures, \"https://\" for remote textures or \"buf://\" for other shaders. It is advised to set the option \"shader-toy.textures.useInShaderTextures\" to true and define your texture path directly inside your shader.");
                            });
                        }
                    }
                }
            };
            for (var i = 0; i < 9; i++) {
                _loop_2(i);
            }
        }
        // Translate buffer names to indices
        var usesSelf = false;
        var selfChannel = 0;
        for (var i = 0; i < textures.length; i++) {
            var texture = textures[i];
            if (texture.Buffer) {
                texture.BufferIndex = buffers.findIndex(findByName(texture.Buffer));
                var dependencyBuffer = buffers[texture.BufferIndex];
                if (dependencyBuffer.UsesSelf) {
                    dependencyBuffer.Dependents.push({
                        Index: buffers.length,
                        Channel: texture.Channel
                    });
                }
            }
            else if (texture.Self) {
                texture.Buffer = stripPath(name);
                texture.BufferIndex = buffers.length;
                usesSelf = true;
                selfChannel = i;
            }
        }
        // Push yourself after all your dependencies
        buffers.push({
            Name: stripPath(name),
            File: name,
            Code: code,
            IncludeName: includeName,
            Textures: textures,
            UsesSelf: usesSelf,
            SelfChannel: selfChannel,
            Dependents: [],
            UsesKeyboard: usesKeyboard,
            LineOffset: line_offset
        });
    };
    return GLSLDocumentContentProvider;
}());
//# sourceMappingURL=extension.js.map