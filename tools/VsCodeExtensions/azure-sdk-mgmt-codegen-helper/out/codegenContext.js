"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenContext = void 0;
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
const util_1 = require("./util");
class CodeGenContext {
    reproRoot;
    serviceDirName;
    packageName;
    get scriptsFolder() {
        return path_1.default.join(this.reproRoot, "eng", "scripts");
    }
    get exportApiScriptPath() {
        return path_1.default.join(this.scriptsFolder, "Export-API.ps1");
    }
    get updateChangelogScriptPath() {
        return path_1.default.join(this.scriptsFolder, "Gen-Mgmt-Changelog.ps1");
    }
    get updateMgmtCiScriptPath() {
        return path_1.default.join(this.scriptsFolder, "Update-Mgmt-CI.ps1");
    }
    get templateFolder() {
        return path_1.default.join(this.reproRoot, "eng", "templates", "Azure.ResourceManager.Template");
    }
    get sdkFolder() {
        return path_1.default.join(this.reproRoot, "sdk");
    }
    get serviceDirFolder() {
        return path_1.default.join(this.sdkFolder, this.serviceDirName);
    }
    get packageFolder() {
        return path_1.default.join(this.serviceDirFolder, this.packageName);
    }
    get srcFolder() {
        return path_1.default.join(this.packageFolder, "src");
    }
    get autorestMdPath() {
        return path_1.default.join(this.srcFolder, "autorest.md");
    }
    get apiFolder() {
        return path_1.default.join(this.packageFolder, "api");
    }
    get changelogPath() {
        return path_1.default.join(this.packageFolder, "CHANGELOG.md");
    }
    constructor(reproRoot, serviceDirName, packageName) {
        this.reproRoot = reproRoot;
        this.serviceDirName = serviceDirName;
        this.packageName = packageName;
    }
    static validateRepoName(path) {
        const repoName = (0, util_1.getRemoteRepoName)(path);
        const EXPECTED_NAME = "azure-sdk-for-net";
        if (repoName !== EXPECTED_NAME) {
            logger_1.Logger.logError(`Unexpected repro name found: ${repoName}. ${EXPECTED_NAME} is expected.`);
            return false;
        }
        return true;
    }
    static fromSdkFolderPath(sdkFolderPath, serviceDirName, packageName) {
        const r = sdkFolderPath.matchAll(/^(.*)[\\/]sdk$/gi);
        if (r === null) {
            return null;
        }
        const matches = [...r];
        if (!this.validateRepoName(sdkFolderPath)) {
            return null;
        }
        return new CodeGenContext(matches[0][1], serviceDirName, packageName);
    }
    static fromChangeLogPath(changelogPath) {
        const r = changelogPath.matchAll(/^(.*)[\\/]sdk[\\/]([\w\d\.\_]+)[\\/](Azure\.ResourceManager(\.[\w\d\.\_]*)?)[\\/]CHANGELOG\.md$/gi);
        if (r === null) {
            return null;
        }
        const matches = [...r];
        if (!this.validateRepoName(path_1.default.dirname(changelogPath))) {
            return null;
        }
        return new CodeGenContext(matches[0][1], matches[0][2], matches[0][3]);
    }
    static fromApiFilePath(apiFilePath) {
        const r = apiFilePath.matchAll(/^(.*)[\\/]sdk[\\/]([\w\d\.\_]+)[\\/](Azure\.ResourceManager(\.[\w\d\.\_]*)?)[\\/]api[\\/]([\w\d\.\_]+)\.cs$/gi);
        if (r === null) {
            return null;
        }
        const matches = [...r];
        if (!this.validateRepoName(path_1.default.dirname(apiFilePath))) {
            return null;
        }
        return new CodeGenContext(matches[0][1], matches[0][2], matches[0][3]);
    }
    static fromApiFolderPath(apiFolderPath) {
        const r = apiFolderPath.matchAll(/^(.*)[\\/]sdk[\\/]([\w\d\.\_]+)[\\/](Azure\.ResourceManager(\.[\w\d\.\_]*)?)[\\/]api[\\/]?$/gi);
        if (r === null) {
            return null;
        }
        const matches = [...r];
        if (!this.validateRepoName(apiFolderPath)) {
            return null;
        }
        return new CodeGenContext(matches[0][1], matches[0][2], matches[0][3]);
    }
    static fromAutorestMdPath(autorestMdPath) {
        const r = autorestMdPath.matchAll(/^(.*)[\\/]sdk[\\/]([\w\d\.\_]+)[\\/](Azure\.ResourceManager(\.[\w\d\.\_]*)?)[\\/]src[\\/]autorest\.md$/gi);
        if (r === null) {
            return null;
        }
        const matches = [...r];
        if (!this.validateRepoName(path_1.default.dirname(autorestMdPath))) {
            return null;
        }
        return new CodeGenContext(matches[0][1], matches[0][2], matches[0][3]);
    }
}
exports.CodeGenContext = CodeGenContext;
;
//# sourceMappingURL=codegenContext.js.map