"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoteRepoName = exports.getGitRoot = exports.getLatestCommitIdFromGitHub = exports.startProcess = exports.runPowershellScript = exports.dotnetBuildGenerateCode = void 0;
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
const path_1 = __importDefault(require("path"));
//#region codegen utils
function dotnetBuildGenerateCode(autorestMdPath, onClose = undefined) {
    const srcFolder = path_1.default.dirname(autorestMdPath);
    startProcess("dotnet", ["build", "/t:GenerateCode"], srcFolder, "codegen", onClose);
}
exports.dotnetBuildGenerateCode = dotnetBuildGenerateCode;
//#endregion
//#region process utils
function runPowershellScript(scriptPath, args, workFolder, onClose = undefined) {
    startProcess("pwsh", ["-file", scriptPath, ...args], workFolder, "ps", onClose);
}
exports.runPowershellScript = runPowershellScript;
function startProcess(exe, args, workFolder, logName, onClose = undefined) {
    logger_1.Logger.logVerbose(`Start running: "${exe} ${args.map(s => `'${s}'`).join(" ")}" in ${workFolder}...`);
    const dn = (0, child_process_1.spawn)(exe, [...args], { cwd: workFolder });
    const logPre = logName ? `${logName}: ` : "";
    dn.stdout.on("data", (data) => {
        logger_1.Logger.logVerbose(`${logPre}${data}`.trim());
    });
    dn.stderr.on("data", (data) => {
        logger_1.Logger.logError(`${logPre}${data}`.trim());
    });
    dn.on("close", (code) => {
        logger_1.Logger.logVerbose(`${logPre}exit code:${code}`.trim());
        if (onClose) {
            onClose(code);
        }
    });
}
exports.startProcess = startProcess;
//#endregion
//#region git utils
async function getLatestCommitIdFromGitHub(username, repoName, branchName) {
    try {
        const response = await axios_1.default.get(`https://api.github.com/repos/${username}/${repoName}/branches/${branchName}`);
        if (response.status === 200 && response.data?.commit?.sha) {
            return response.data.commit.sha;
        }
        else {
            logger_1.Logger.logError(`Error fetching commit ID: ${response.statusText}`);
            return null;
        }
    }
    catch (error) {
        logger_1.Logger.logError(`Error fetching commit ID: ${error.message}`);
        return null;
    }
}
exports.getLatestCommitIdFromGitHub = getLatestCommitIdFromGitHub;
function getGitRoot(cwd) {
    try {
        const gitRoot = (0, child_process_1.execSync)('git rev-parse --show-toplevel', { cwd: cwd, encoding: 'utf-8' }).trim();
        return gitRoot;
    }
    catch (error) {
        logger_1.Logger.logError(`Error fetching git root: ${error}`);
        return null;
    }
}
exports.getGitRoot = getGitRoot;
function getRemoteRepoName(cwd) {
    try {
        const remoteUrl = (0, child_process_1.execSync)('git config --get remote.origin.url', { cwd: cwd, encoding: 'utf-8' }).trim();
        const repoName = remoteUrl.split('/').pop()?.replace('.git', '') || null;
        return repoName;
    }
    catch (error) {
        logger_1.Logger.logError(`Error fetching remote repo name: ${error}`);
        return null;
    }
}
exports.getRemoteRepoName = getRemoteRepoName;
//endregion
//# sourceMappingURL=util.js.map