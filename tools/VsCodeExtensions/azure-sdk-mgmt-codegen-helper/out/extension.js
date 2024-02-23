"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const codegenHelper_1 = require("./codegenHelper");
const codegenContext_1 = require("./codegenContext");
const logger_1 = require("./logger");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "azure-sdk-mgmt-codegen-helper" is now active!');
    const progressStatusCommandId = "azure-sdk-mgmt-codegen-helper.progress-status";
    let progressStatusCommand = vscode.commands.registerCommand(progressStatusCommandId, () => {
        // do nothing for now
    });
    let progressStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    progressStatusBarItem.command = progressStatusCommandId;
    let createCodeGenContext = (path) => {
        // should be good enough for now
        if (!path) {
            return null;
        }
        else if (path.endsWith("autorest.md")) {
            return codegenContext_1.CodeGenContext.fromAutorestMdPath(path);
        }
        else if (path.endsWith("CHANGELOG.md")) {
            return codegenContext_1.CodeGenContext.fromChangeLogPath(path);
        }
        else if (path.endsWith("api")) {
            return codegenContext_1.CodeGenContext.fromApiFolderPath(path);
        }
        else if (path.endsWith(".netstandard2.0.cs")) {
            return codegenContext_1.CodeGenContext.fromApiFilePath(path);
        }
        else {
            return null;
        }
    };
    let doWorkAsync = async (workName, work) => {
        try {
            progressStatusBarItem.text = `$(sync~spin) ${workName}...`;
            progressStatusBarItem.show();
            logger_1.Logger.showLogOutput();
            logger_1.Logger.logInfo(`Start ${workName}...`);
            await work();
            logger_1.Logger.logInfo(`Finish ${workName}. Check Output log for details.`, true /*popup*/);
        }
        catch (error) {
            logger_1.Logger.logError(`Error occurs when ${workName}: ${error}`);
        }
        finally {
            progressStatusBarItem.hide();
        }
    };
    let regenDisposible = vscode.commands.registerCommand("azure-sdk-mgmt-codegen-helper.regenerate-code", async (context) => {
        const cg = createCodeGenContext(context.fsPath);
        if (!cg) {
            logger_1.Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
            return;
        }
        await doWorkAsync("generating code", async () => { await codegenHelper_1.CodeGenHelper.generateCode(cg); });
    });
    let regenLatestDisposable = vscode.commands.registerCommand("azure-sdk-mgmt-codegen-helper.regenerate-code-with-latest-spec", async (context) => {
        const cg = createCodeGenContext(context.fsPath);
        if (!cg) {
            logger_1.Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
            return;
        }
        await doWorkAsync("generating code with latest spec", async () => { await codegenHelper_1.CodeGenHelper.generateCodeWithLatestSpec(cg); });
    });
    let regenApiFileDisposiable = vscode.commands.registerCommand("azure-sdk-mgmt-codegen-helper.regenerate-api-file", async (context) => {
        const cg = createCodeGenContext(context.fsPath);
        if (!cg) {
            logger_1.Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
            return;
        }
        await doWorkAsync("generating api file", async () => { await codegenHelper_1.CodeGenHelper.generateApiFile(cg); });
    });
    let updateChangelogDisposiable = vscode.commands.registerCommand("azure-sdk-mgmt-codegen-helper.update-changelog", async (context) => {
        const cg = createCodeGenContext(context.fsPath);
        if (!cg) {
            logger_1.Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
            return;
        }
        await doWorkAsync("updating changelog", async () => { await codegenHelper_1.CodeGenHelper.updateChangeLog(cg); });
    });
    let createNewServiceDisposiable = vscode.commands.registerCommand("azure-sdk-mgmt-codegen-helper.init-new-service", async (context) => {
        if (context?.fsPath && context.fsPath.endsWith("sdk")) {
            await doWorkAsync("initializing new service", async () => { await codegenHelper_1.CodeGenHelper.initNewSdk(context.fsPath); });
        }
        else {
            logger_1.Logger.logError(`Unexpected fsPath: ${context.fsPath}.`);
        }
    });
    context.subscriptions.push(regenDisposible, regenLatestDisposable, regenApiFileDisposiable, updateChangelogDisposiable, createNewServiceDisposiable, progressStatusCommand, progressStatusBarItem);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map