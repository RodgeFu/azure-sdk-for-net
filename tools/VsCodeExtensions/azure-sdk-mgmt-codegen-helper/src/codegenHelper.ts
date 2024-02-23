import { Logger } from './logger';
import { dotnetBuildGenerateCode, getLatestCommitIdFromGitHub, runPowershellScript, startProcess } from './util';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { CodeGenContext } from './codegenContext';
import * as vscode from 'vscode';

export class CodeGenHelper{

    public static async generateCode(cgContext: CodeGenContext){
        await dotnetBuildGenerateCode(cgContext.autorestMdPath);
    }

    public static async generateCodeWithLatestSpec(cgContext: CodeGenContext){
        try{
            const value = await getLatestCommitIdFromGitHub("Azure", "azure-rest-api-specs", "main");
            const autorestMdPath = cgContext.autorestMdPath;
            Logger.logInfo("Update spec ref in autorest.md to latest commit with id: " + value);
            const autorestMd = readFileSync(autorestMdPath, 'utf-8');
            const newAutorestMd = autorestMd.replace(/(https:\/\/github\.com\/Azure\/azure-rest-api-specs\/blob\/)([\w\d]+)(\/specification\/.+)/gi,
                `$1${value}$3`);
            writeFileSync(autorestMdPath, newAutorestMd, 'utf-8');
            await dotnetBuildGenerateCode(autorestMdPath);
            Logger.logInfo("Code generation completed.");
        }
        catch(reason){
            Logger.logError(
                "Error occurs when fetching latest commit id: " + reason
            );
            throw reason;
        }
    }

    public static async generateApiFile(cgContext: CodeGenContext){
        await runPowershellScript(cgContext.exportApiScriptPath, [cgContext.serviceDirName], cgContext.apiFolder);
    }

    public static async updateChangeLog(cgContext: CodeGenContext){

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
            validateInput: (value: string) => {
                if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return null;
                }
                return "Invalid date format. Please enter date in format: yyyy-MM-dd";
            }
        });

        if (!version || !releaseDate) {
            throw new Error(`Invalid version or releaseDate. Updating changelog cancelled.`);
        }
        else {
            await runPowershellScript(cgContext.updateChangelogScriptPath, [cgContext.serviceDirName, version, releaseDate], cgContext.packageFolder);
        }
    }

    public static async initNewSdk(sdkFolderPath: string){

        const serviceDirName = await vscode.window.showInputBox({
            prompt: "Enter a directory name that precisely represents your service while being concise and easily understandable. Make sure to use snake case and avoid acronyms.",
            placeHolder: "i.e. servicelinker",
            ignoreFocusOut: true,
            title: "Directory Name for the new service",
            validateInput: (value: string) => {
                if (value.match(/^[a-z0-9_\-]+$/)) {
                    return null;
                }
                return "Invalid directory name. Please use snake case and avoid acronyms.";
            }
        });

        if (serviceDirName === undefined || serviceDirName.length === 0) {
            throw new Error("Invalid directory name. Creating new service cancelled.");
        }

        const defaultPackageName = (serviceDirName[0].toUpperCase() + serviceDirName.slice(1)).replace(/[_\-]/g, "");

        const packageName = await vscode.window.showInputBox({
            prompt: "Enter your SDK package name. If you are not clear how to name your SDK package properly, you should request an SDK package name review as early as possible.",
            placeHolder: "i.e. Azure.ResourceManager.Servicelinker",
            value: `Azure.ResourceManager.${defaultPackageName}`,
            ignoreFocusOut: true,
            title: "Package Name for the new service",
            validateInput: (value: string) => {
                if (value.match(/^Azure\.ResourceManager\.[\w\d_]+$/)) {
                    return null;
                }
                return "Invalid package name. Please use Azure.ResourceManager.<servicename>";
            }
        });

        if (packageName === undefined || packageName.length === 0) {
            throw new Error("Invalid package name. Creating new service cancelled.");
        }

        const defaultServiceName = packageName.split('.').pop() || "";
        const serviceName = await vscode.window.showInputBox({
            prompt: "Enter your service name. This is the name of the service that you are creating the SDK for.",
            placeHolder: "i.e. ServiceLinker",
            value: defaultServiceName,
            ignoreFocusOut: true,
            title: "Service Name for the new service",
            validateInput: (value: string) => {
                if (value.match(/^[\w\d_]+$/)) {
                    return null;
                }
                return "Invalid service name. Please enter a valid service name.";
            }
        });

        if (serviceName === undefined || serviceName.length === 0) {
            throw new Error("Invalid service name. Creating new service cancelled.");
        }

        const cg = CodeGenContext.fromSdkFolderPath(sdkFolderPath, serviceDirName, packageName);
        if(!cg){
            throw new Error("Failed to create context from sdk folder " + sdkFolderPath);
        }

        if(existsSync(cg.packageFolder)){
            Logger.logWarning(`Folder ${cg.serviceDirFolder} already exists.`);
        }
        else{
            mkdirSync(cg.packageFolder, { recursive: true });
            Logger.logInfo(`Folder ${cg.serviceDirFolder} created.`);
        }

        if (!existsSync(cg.packageFolder)) {
            throw new Error(`Failed to create folder ${cg.packageFolder}. Creating new service cancelled.`);
        }

        await startProcess("dotnet", ["new", "install", cg.templateFolder, "--force"], sdkFolderPath, "dotnet");
        await startProcess("dotnet", ["new", "azuremgmt", "--provider", serviceName, "--includeCI", "true"], cg.packageFolder, "dotnet");
        await runPowershellScript(cg.updateMgmtCiScriptPath, [], cg.packageFolder);
    }

}