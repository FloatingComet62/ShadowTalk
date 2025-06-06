/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("http");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Logger = exports.Log = void 0;
exports.infoLogger = infoLogger;
exports.warnLogger = warnLogger;
exports.errorLogger = errorLogger;
exports.noLogger = noLogger;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["INFO"] = 0] = "INFO";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["ERROR"] = 2] = "ERROR";
    LogLevel[LogLevel["NO_LOG"] = 3] = "NO_LOG";
})(LogLevel || (LogLevel = {}));
class Log {
    constructor(log_level, workspace) {
        this.log_level = log_level;
        this.workspace = workspace;
    }
    addWorkspace(workspace) {
        return new Log(this.log_level, [...this.workspace, workspace]);
    }
    info(message) {
        if (this.log_level > LogLevel.INFO) {
            return;
        }
        console.log(`[INFO] ${this.workspace.join('/')}: ${message}`);
    }
    warn(message) {
        if (this.log_level > LogLevel.WARN) {
            return;
        }
        console.warn(`[WARN] ${this.workspace.join('/')}: ${message}`);
    }
    error(message) {
        if (this.log_level > LogLevel.ERROR) {
            return;
        }
        console.error(`[ERROR] ${this.workspace.join('/')}: ${message}`);
    }
}
exports.Log = Log;
function infoLogger(workspace) {
    return new Log(LogLevel.INFO, workspace);
}
function warnLogger(workspace) {
    return new Log(LogLevel.WARN, workspace);
}
function errorLogger(workspace) {
    return new Log(LogLevel.ERROR, workspace);
}
function noLogger(workspace) {
    return new Log(LogLevel.NO_LOG, workspace);
}
exports.Logger = process.env.IS_DEV == "true" ? infoLogger : warnLogger;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const http_1 = __webpack_require__(3);
const socket_io_1 = __webpack_require__(4);
const logging_1 = __webpack_require__(5);
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const logger = (0, logging_1.Logger)(['api']);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Allow all origins for simplicity; adjust as needed
    }
});
io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});
server.listen(process.env.PORT, () => {
    logger.info(`Listening on ${process.env.PORT}`);
});
server.on('error', console.error);

})();

/******/ })()
;