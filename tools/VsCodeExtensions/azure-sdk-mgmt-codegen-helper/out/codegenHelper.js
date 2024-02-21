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
exports.CodeGenHelper = void 0;
const logger_1 = require("./logger");
const util_1 = require("./util");
const fs_1 = require("fs");
const codegenContext_1 = require("./codegenContext");
const vscode = __importStar(require("vscode"));
class CodeGenHelper {
    static generateCode(cgContext) {
        logger_1.Logger.showLogOutput();
        logger_1.Logger.logInfo("Generate code...");
        (0, util_1.dotnetBuildGenerateCode)(cgContext.autorestMdPath, (code) => { logger_1.Logger.logInfo("Code generation completed"); });
    }
    static generateCodeWithLatestSpec(cgContext) {
        logger_1.Logger.showLogOutput();
        logger_1.Logger.logInfo("Generate code with latest azure-rest-api-spec...");
        (0, util_1.getLatestCommitIdFromGitHub)("Azure", "azure-rest-api-specs", "main").then((value) => {
            try {
                const autorestMdPath = cgContext.autorestMdPath;
                logger_1.Logger.logInfo("Update spec ref in autorest.md to latest commit with id: " + value);
                const autorestMd = (0, fs_1.readFileSync)(autorestMdPath, 'utf-8');
                const newAutorestMd = autorestMd.replace(/(https:\/\/github\.com\/Azure\/azure-rest-api-specs\/blob\/)([\w\d]+)(\/specification\/.+)/gi, `$1${value}$3`);
                (0, fs_1.writeFileSync)(autorestMdPath, newAutorestMd, 'utf-8');
                (0, util_1.dotnetBuildGenerateCode)(autorestMdPath, (code) => { logger_1.Logger.logInfo("Code generation completed"); });
            }
            catch (error) {
                logger_1.Logger.logError("Unexpected error: " + error);
            }
        }, (reason) => {
            logger_1.Logger.logError("Error occurs when fetching latest commit id: " + reason);
        });
    }
    static generateApiFile(cgContext) {
        logger_1.Logger.showLogOutput();
        logger_1.Logger.logInfo("Regenerate api file...");
        (0, util_1.runPowershellScript)(cgContext.exportApiScriptPath, [cgContext.serviceDirName], cgContext.apiFolder, (code) => { logger_1.Logger.logInfo("API file generation completed."); });
    }
    static async updateChangeLog(cgContext) {
        logger_1.Logger.showLogOutput();
        logger_1.Logger.logInfo("Update CHANGELOG.md...");
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
        if (!version || !releaseDate) {
            logger_1.Logger.logError(`Invalid version or releaseDate. Updating changelog cancelled.`);
        }
        else {
            (0, util_1.runPowershellScript)(cgContext.updateChangelogScriptPath, [cgContext.serviceDirName, version, releaseDate], cgContext.packageFolder, (code) => { logger_1.Logger.logInfo("Changelog update completed."); });
        }
    }
    static async initNewSdk(sdkFolderPath) {
        logger_1.Logger.showLogOutput();
        logger_1.Logger.logInfo("Initialize New Azure SDK Service (Mgmt Plane)...");
        const serviceDirName = await vscode.window.showInputBox({
            prompt: "Enter a directory name that precisely represents your service while being concise and easily understandable. Make sure to use snake case and avoid acronyms.",
            placeHolder: "i.e. servicelinker",
            ignoreFocusOut: true,
            title: "Directory Name for the new service",
            validateInput: (value) => {
                if (value.match(/^[a-z0-9_\-]+$/)) {
                    return null;
                }
                return "Invalid directory name. Please use snake case and avoid acronyms.";
            }
        });
        if (serviceDirName === undefined || serviceDirName.length === 0) {
            logger_1.Logger.logError("Invalid directory name. Creating new service cancelled.");
            return;
        }
        const defaultPackageName = (serviceDirName[0].toUpperCase() + serviceDirName.slice(1)).replace(/[_\-]/g, "");
        const packageName = await vscode.window.showInputBox({
            prompt: "Enter your SDK package name. If you are not clear how to name your SDK package properly, you should request an SDK package name review as early as possible.",
            placeHolder: "i.e. Azure.ResourceManager.Servicelinker",
            value: `Azure.ResourceManager.${defaultPackageName}`,
            ignoreFocusOut: true,
            title: "Package Name for the new service",
            validateInput: (value) => {
                if (value.match(/^Azure\.ResourceManager\.[\w\d_]+$/)) {
                    return null;
                }
                return "Invalid package name. Please use Azure.ResourceManager.<servicename>";
            }
        });
        if (packageName === undefined || packageName.length === 0) {
            logger_1.Logger.logError("Invalid package name. Creating new service cancelled.");
            return;
        }
        const defaultServiceName = packageName.split('.').pop() || "";
        const serviceName = await vscode.window.showInputBox({
            prompt: "Enter your service name. This is the name of the service that you are creating the SDK for.",
            placeHolder: "i.e. ServiceLinker",
            value: defaultServiceName,
            ignoreFocusOut: true,
            title: "Service Name for the new service",
            validateInput: (value) => {
                if (value.match(/^[\w\d_]+$/)) {
                    return null;
                }
                return "Invalid service name. Please enter a valid service name.";
            }
        });
        if (serviceName === undefined || serviceName.length === 0) {
            logger_1.Logger.logError("Invalid service name. Creating new service cancelled.");
            return;
        }
        const cg = codegenContext_1.CodeGenContext.fromSdkFolderPath(sdkFolderPath, serviceDirName, packageName);
        if (!cg) {
            logger_1.Logger.logError("Failed to create context from sdk folder " + sdkFolderPath);
            return;
        }
        if ((0, fs_1.existsSync)(cg.packageFolder)) {
            logger_1.Logger.logWarning(`Folder ${cg.serviceDirFolder} already exists.`);
        }
        else {
            (0, fs_1.mkdirSync)(cg.packageFolder, { recursive: true });
            logger_1.Logger.logInfo(`Folder ${cg.serviceDirFolder} created.`);
        }
        if (!(0, fs_1.existsSync)(cg.packageFolder)) {
            logger_1.Logger.logError(`Failed to create folder ${cg.packageFolder}. Creating new service cancelled.`);
            return;
        }
        (0, util_1.startProcess)("dotnet", ["new", "install", cg.templateFolder, "--force"], sdkFolderPath, "dotnet", (exitCode1) => {
            if (exitCode1 !== 0) {
                logger_1.Logger.logError("Failed to install template. Creating new service cancelled.");
                return;
            }
            (0, util_1.startProcess)("dotnet", ["new", "azuremgmt", "--provider", serviceName, "--includeCI", "true"], cg.packageFolder, "dotnet", (exitCode2) => {
                if (exitCode2 !== 0) {
                    logger_1.Logger.logError("Failed to new azuremgmt. Creating new service cancelled.");
                    return;
                }
                (0, util_1.runPowershellScript)(cg.updateMgmtCiScriptPath, [], cg.packageFolder, (exitCode3) => {
                    if (exitCode3 !== 0) {
                        logger_1.Logger.logError("Failed to update CI. Creating new service cancelled.");
                        return;
                    }
                    logger_1.Logger.logInfo("New service created successfully.");
                });
            });
        });
    }
}
exports.CodeGenHelper = CodeGenHelper;
//# sourceMappingURL=codegenHelper.js.map