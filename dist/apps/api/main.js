/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
module.exports = require("socket.io");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

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


/***/ }),
/* 6 */
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthenticationType = void 0;
var AuthenticationType;
(function (AuthenticationType) {
    AuthenticationType[AuthenticationType["None"] = 0] = "None";
    AuthenticationType[AuthenticationType["User"] = 1] = "User";
    AuthenticationType[AuthenticationType["Admin"] = 2] = "Admin";
})(AuthenticationType || (exports.AuthenticationType = AuthenticationType = {}));


/***/ }),
/* 8 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./ping.ts": 9
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 8;

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const v4_1 = __webpack_require__(10);
const types_1 = __webpack_require__(7);
const zodSchema = v4_1.z.object({
    hello: v4_1.z.string().refine((val) => val === "world", {
        message: "Hello must be 'world'",
    })
});
exports["default"] = {
    allowedAuthentication: [
        types_1.AuthenticationType.None,
        types_1.AuthenticationType.User,
        types_1.AuthenticationType.Admin
    ],
    zodSchema,
    handler: (data, emit) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        emit.reply({
            message: `Pong! Received: ${data.hello}`
        });
    })
};


/***/ }),
/* 10 */
/***/ ((module) => {

"use strict";
module.exports = require("zod/v4");

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
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const http_1 = __webpack_require__(3);
const socket_io_1 = __webpack_require__(4);
const logging_1 = __webpack_require__(5);
const path_1 = tslib_1.__importDefault(__webpack_require__(6));
const types_1 = __webpack_require__(7);
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const globalLogger = (0, logging_1.Logger)(['api']);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Allow all origins for simplicity; adjust as needed
    }
});
const JS_FILE = (file) => file.endsWith('.js') && !file.startsWith('index');
const auth = {};
// read events from the 'events' directory
const folderPath = path_1.default.join(__dirname, 'events');
function iterateEvents(socket, socketLogger, handler) {
    const context = __webpack_require__(8);
    context.keys().forEach((key) => {
        const event = context(key);
        const event_name = key.replace('./', '').replace('.ts', '');
        const eventLogger = socketLogger.addWorkspace(event_name);
        socket.on(event_name, (data) => handler(eventLogger, event, data, {
            reply: (data) => {
                eventLogger.info(`Reply data: ${JSON.stringify(data)}`);
                socket.emit(event_name + '.reply', JSON.stringify(data));
            },
            error: (data) => {
                eventLogger.warn(`Error data: ${JSON.stringify(data)}`);
                socket.emit(event_name + '.error', JSON.stringify(data));
            }
        }));
    });
}
io.on('connection', (socket) => {
    globalLogger.info(`New client connected: ${socket.id}`);
    const logger = globalLogger.addWorkspace(socket.id);
    auth[socket.id] = types_1.AuthenticationType.None;
    socket.on('authenticate', (data) => {
        logger.addWorkspace('authenticate').info(JSON.stringify(data));
        auth[socket.id] = types_1.AuthenticationType.User; // Simulate authentication
        socket.emit('authenticate.reply', { success: true, message: 'Authenticated successfully' });
    });
    iterateEvents(socket, logger, (eventLogger, event, data, emit) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        eventLogger.info(JSON.stringify(data));
        if (!auth[socket.id] || !event.allowedAuthentication.includes(auth[socket.id])) {
            return emit.error({ message: 'Unauthorized' });
        }
        const result = event.zodSchema.safeParse(data);
        if (!result.success) {
            return emit.error({ message: result.error.message });
        }
        yield event.handler(result.data, emit);
    }));
    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        delete auth[socket.id];
    });
});
server.listen(process.env.PORT, () => {
    globalLogger.info(`Listening on ${process.env.PORT}`);
});
server.on('error', (err) => globalLogger.error(`Server error: ${err.message}`));

})();

/******/ })()
;