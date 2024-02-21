import { Logger } from './logger';
import { dotnetBuildGenerateCode, getLatestCommitIdFromGitHub, runPowershellScript, startProcess } from './util';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { CodeGenContext } from './codegenContext';
import * as vscode from 'vscode';

export class CodeGenHelper{

    public static generateCode(cgContext: CodeGenContext){
        Logger.showLogOutput();
        Logger.logInfo("Generate code...");
        dotnetBuildGenerateCode(cgContext.autorestMdPath, (code) => {Logger.logInfo("Code generation completed");});
    }

    public static generateCodeWithLatestSpec(cgContext: CodeGenContext){
        Logger.showLogOutput();
        Logger.logInfo("Generate code with latest azure-rest-api-spec...");

        getLatestCommitIdFromGitHub("Azure", "azure-rest-api-specs", "main").then(
            (value) =>{
                try{
                    const autorestMdPath = cgContext.autorestMdPath;
                    Logger.logInfo("Update spec ref in autorest.md to latest commit with id: " + value);
                    const autorestMd = readFileSync(autorestMdPath, 'utf-8');
                    const newAutorestMd = autorestMd.replace(/(https:\/\/github\.com\/Azure\/azure-rest-api-specs\/blob\/)([\w\d]+)(\/specification\/.+)/gi,
                        `$1${value}$3`);
                    writeFileSync(autorestMdPath, newAutorestMd, 'utf-8');
                    dotnetBuildGenerateCode(autorestMdPath, (code) => {Logger.logInfo("Code generation completed");});
                }
                catch(error){
                    Logger.logError(
                        "Unexpected error: " + error
                    );
                }
            },
            (reason) => {
                Logger.logError(
                    "Error occurs when fetching latest commit id: " + reason
                );
            }
        );
    }

    public static generateApiFile(cgContext: CodeGenContext){
        Logger.showLogOutput();
        Logger.logInfo("Regenerate api file...");
        
        runPowershellScript(cgContext.exportApiScriptPath, [cgContext.serviceDirName], cgContext.apiFolder, (code) => {Logger.logInfo("API file generation completed.");});
    }

    public static async updateChangeLog(cgContext: CodeGenContext){
        Logger.showLogOutput();
        Logger.logInfo("Update CHANGELOG.md...");

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
            Logger.logError(`Invalid version or releaseDate. Updating changelog cancelled.`);
        }
        else {
            runPowershellScript(cgContext.updateChangelogScriptPath, [cgContext.serviceDirName, version, releaseDate], cgContext.packageFolder, (code) => { Logger.logInfo("Changelog update completed."); });
        }
    }

    public static async initNewSdk(sdkFolderPath: string){
        Logger.showLogOutput();
        Logger.logInfo("Initialize New Azure SDK Service (Mgmt Plane)...");

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
            Logger.logError("Invalid directory name. Creating new service cancelled.");
            return;
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
            Logger.logError("Invalid package name. Creating new service cancelled.");
            return;
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
            Logger.logError("Invalid service name. Creating new service cancelled.");
            return;
        }

        const cg = CodeGenContext.fromSdkFolderPath(sdkFolderPath, serviceDirName, packageName);
        if(!cg){
            Logger.logError("Failed to create context from sdk folder " + sdkFolderPath);
            return;
        }

        if(existsSync(cg.packageFolder)){
            Logger.logWarning(`Folder ${cg.serviceDirFolder} already exists.`);
        }
        else{
            mkdirSync(cg.packageFolder, { recursive: true });
            Logger.logInfo(`Folder ${cg.serviceDirFolder} created.`);
        }

        if (!existsSync(cg.packageFolder)) {
            Logger.logError(`Failed to create folder ${cg.packageFolder}. Creating new service cancelled.`);
            return;
        }

        startProcess("dotnet", ["new", "install", cg.templateFolder, "--force"], sdkFolderPath, "dotnet", (exitCode1) => {

            if (exitCode1 !== 0) {
                Logger.logError("Failed to install template. Creating new service cancelled.");
                return;
            }
            startProcess("dotnet", ["new", "azuremgmt", "--provider", serviceName, "--includeCI", "true"], cg.packageFolder, "dotnet", (exitCode2) => {
                if (exitCode2 !== 0) {
                    Logger.logError("Failed to new azuremgmt. Creating new service cancelled.");
                    return;
                }

                runPowershellScript(cg.updateMgmtCiScriptPath, [], cg.packageFolder, (exitCode3) => {
                    if (exitCode3 !== 0) {
                        Logger.logError("Failed to update CI. Creating new service cancelled.");
                        return;
                    }

                    Logger.logInfo("New service created successfully.");
                });

            });
        });
    }

}