"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let processingDocs = 'https://processing.org/reference/';
let processingSearch = 'https://www.google.com/search?as_sitesearch=processing.org&as_q=';
// Open a URL using the npm module "opn"
let opn = require('opn');
function openURL(search_base, s) {
    if (search_base === 'open') {
        opn(s);
    }
    else {
        if (!s) {
            s = processingDocs;
        }
        else {
            s = processingSearch + s;
        }
        opn(s);
    }
    return true;
}
exports.openURL = openURL;
// Slice and Trim
function prepareInput(input, start, end) {
    // input is the whole line, part of which is selected by the user (defined by star/end)
    if (start >= end) {
        return '';
    }
    // Slice to just the selection
    input = input.slice(start, end);
    // Trim white space
    input = input.trim();
    // Possible future addition:
    // Check right here if valid variable/function name to search?
    // Everything looks good by this point, so time to open a web browser!
    return input;
}
exports.prepareInput = prepareInput;
function openProcessingDocs(input, start, end) {
    // Use the node module "opn" to open a web browser
    openURL('docs', prepareInput(input, start, end));
}
exports.openProcessingDocs = openProcessingDocs;
//# sourceMappingURL=search.js.map