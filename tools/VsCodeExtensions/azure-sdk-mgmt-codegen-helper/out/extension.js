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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "azure-sdk-mgmt-codegen-helper" is now active!');
    let disposable = vscode.commands.registerCommand("azure-sdk-mgmt-codegen-helper.regenerate-code", (context) => {
        let output = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");
        output.show();
        output.appendLine("Generate code...");
        let folder = path_1.default.dirname(context.fsPath);
        dotnetBuildGenerateCode(folder, output, (code) => { vscode.window.showInformationMessage("Code generation completed. Check OUTPUT for details."); });
    });
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable1 = vscode.commands.registerCommand("azure-sdk-mgmt-codegen-helper.regenerate-code-with-latest-spec", (context) => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        let output = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");
        output.show();
        output.appendLine("Generate code with latest azure-rest-api-spec...");
        getLatestCommitIdFromGitHub("Azure", "azure-rest-api-specs", "main").then((value) => {
            try {
                output.appendLine("Update azure-rest-api-specs to latest commit id: " + value);
                const autorestMd = (0, fs_1.readFileSync)(context.fsPath, 'utf-8');
                const newAutorestMd = autorestMd.replace(/(https:\/\/github\.com\/Azure\/azure-rest-api-specs\/blob\/)([\w\d]+)(\/specification\/.+)/gi, `$1${value}$3`);
                (0, fs_1.writeFileSync)(context.fsPath, newAutorestMd, 'utf-8');
                let folder = path_1.default.dirname(context.fsPath);
                dotnetBuildGenerateCode(folder, output, (code) => { vscode.window.showInformationMessage("Code generation completed. Check OUTPUT for details."); });
            }
            catch (error) {
                vscode.window.showErrorMessage("Unexpected error: " + error);
            }
        }, (reason) => {
            vscode.window.showErrorMessage("Error fetching latest commit id: " + reason);
        });
    });
    let disposiable2 = vscode.commands.registerCommand("azure-sdk-mgmt-codegen-helper.regenerate-api-file", (context) => {
        let output = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");
        output.show();
        output.appendLine("Regenerate api file...");
        let folder = path_1.default.dirname(context.fsPath);
        const info = parseAutorestMdPath(context.fsPath);
        if (!info.isMatch) {
            vscode.window.showErrorMessage("Invalid autorest.md file path: " + context.fsPath);
        }
        else {
            const genApiScript = path_1.default.join(info.repoRootPath, "eng", "scripts", "Export-API.ps1");
            runPowershellScript(genApiScript, [info.serviceName], folder, output, (code) => { vscode.window.showInformationMessage("API file generation completed. Check OUTPUT for details."); });
        }
    });
    let disposiable3 = vscode.commands.registerCommand("azure-sdk-mgmt-codegen-helper.update-changelog", async (context) => {
        let output = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");
        output.show();
        output.appendLine("Update changelog...");
        let folder = path_1.default.dirname(context.fsPath);
        const info = parseAutorestMdPath(context.fsPath);
        if (!info.isMatch) {
            vscode.window.showErrorMessage("Invalid autorest.md file path: " + context.fsPath);
        }
        else {
            const version = await vscode.window.showInputBox({
                prompt: "Enter the version number of new release. i.e. 1.0.0",
                placeHolder: "1.0.0",
                ignoreFocusOut: true,
                title: "New Release Version"
            });
            const releaseDate = await vscode.window.showInputBox({
                prompt: "Enter the release date of new release. i.e. 2021-09-01",
                placeHolder: "2021-09-01",
                ignoreFocusOut: true,
                title: "New Release Date",
                validateInput: (value) => {
                    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        return null;
                    }
                    return "Invalid date format. Please enter date in format: yyyy-MM-dd";
                }
            });
            if (version === undefined || releaseDate === undefined) {
                output.appendLine("Updating changelog cancelled.");
                vscode.window.showInformationMessage("Updating changelog cancelled.");
            }
            else {
                const genApiScript = path_1.default.join(info.repoRootPath, "eng", "scripts", "Gen-Mgmt-Changelog.ps1");
                runPowershellScript(genApiScript, [info.serviceName, version, releaseDate], folder, output, (code) => { vscode.window.showInformationMessage("Changelog update completed. Check OUTPUT for details."); });
            }
        }
    });
    context.subscriptions.push(disposable, disposable1, disposiable2, disposiable3);
}
exports.activate = activate;
function parseAutorestMdPath(autorestMdPath) {
    const r = autorestMdPath.matchAll(/^(.*)[\\/]sdk[\\/]([\w\d\.\_]+)[\\/]Azure\.ResourceManager(\.[\w\d\.\_]*)?[\\/]src[\\/]autorest\.md$/gi);
    if (r === null) {
        return { isMatch: false, repoRootPath: "", serviceName: "" };
    }
    const matches = [...r];
    return {
        isMatch: true,
        repoRootPath: matches[0][1],
        serviceName: matches[0][2]
    };
}
function runPowershellScript(scriptPath, args, workFolder, output, onClose = undefined) {
    startProcess("pwsh", ["-file", scriptPath, ...args], workFolder, output, "ps", onClose);
}
function dotnetBuildGenerateCode(folder, output, onClose = undefined) {
    startProcess("dotnet", ["build", "/t:GenerateCode"], folder, output, "codegen", onClose);
}
function startProcess(exe, args, workFolder, output, logGroup, onClose = undefined) {
    output.appendLine(`Start running: "${exe} ${args.map(s => `'${s}'`).join(" ")}" in ${workFolder}...`);
    const dn = (0, child_process_1.spawn)(exe, [...args], { cwd: workFolder });
    dn.stdout.on("data", (data) => {
        output.appendLine(`${logGroup}: ${data}`.trim());
    });
    dn.stderr.on("data", (data) => {
        output.appendLine(`${logGroup}-error: ${data}`.trim());
    });
    dn.on("close", (code) => {
        output.appendLine(`${logGroup}: exit code:${code}`.trim());
        if (onClose) {
            onClose(code);
        }
    });
}
async function getLatestCommitIdFromGitHub(username, repoName, branchName) {
    try {
        const response = await axios_1.default.get(`https://api.github.com/repos/${username}/${repoName}/branches/${branchName}`);
        if (response.status === 200 && response.data?.commit?.sha) {
            return response.data.commit.sha;
        }
        else {
            console.error("Error fetching commit ID:", response.statusText);
            return null;
        }
    }
    catch (error) {
        console.error("Error fetching commit ID:", error.message);
        return null;
    }
}
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map