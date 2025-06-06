"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=index.js.map