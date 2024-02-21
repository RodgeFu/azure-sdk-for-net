import path from "path";
import { Logger } from "./logger";
import { getRemoteRepoName } from "./util";

export class CodeGenContext{

    public reproRoot: string;
    public serviceDirName: string;
    public packageName: string;

    public get scriptsFolder(){
        return path.join(this.reproRoot, "eng", "scripts");
    }
    public get exportApiScriptPath(){
        return path.join(this.scriptsFolder, "Export-API.ps1");
    }
    public get updateChangelogScriptPath(){
        return path.join(this.scriptsFolder, "Gen-Mgmt-Changelog.ps1");
    }
    public get updateMgmtCiScriptPath(){
        return path.join(this.scriptsFolder, "Update-Mgmt-CI.ps1");
    }
    public get templateFolder(){
        return path.join(this.reproRoot, "eng", "templates", "Azure.ResourceManager.Template");
    }
    public get sdkFolder(){
        return path.join(this.reproRoot, "sdk");
    }
    public get serviceDirFolder(){
        return path.join(this.sdkFolder, this.serviceDirName);
    }
    public get packageFolder(){
        return path.join(this.serviceDirFolder, this.packageName);
    }
    public get srcFolder(){
        return path.join(this.packageFolder, "src");
    }
    public get autorestMdPath(){
        return path.join(this.srcFolder, "autorest.md");
    }
    public get apiFolder(){
        return path.join(this.packageFolder, "api");
    }
    public get changelogPath(){
        return path.join(this.packageFolder, "CHANGELOG.md");
    }

    private constructor(reproRoot: string, serviceDirName: string, packageName: string){
        this.reproRoot = reproRoot;
        this.serviceDirName = serviceDirName;
        this.packageName = packageName;
    }

    private static validateRepoName(path: string){
        const repoName = getRemoteRepoName(path);
        const EXPECTED_NAME = "azure-sdk-for-net";
        if(repoName !== EXPECTED_NAME){
            Logger.logError(`Unexpected repro name found: ${repoName}. ${EXPECTED_NAME} is expected.`);
            return false;
        }
        return true;
    }

    public static fromSdkFolderPath(sdkFolderPath: string, serviceDirName: string, packageName: string){
        const r = sdkFolderPath.matchAll(/^(.*)[\\/]sdk$/gi);
        if(r === null){
            return null;
        }
        const matches = [...r];
        
        if(!this.validateRepoName(sdkFolderPath)){
            return null;
        }

        return new CodeGenContext(matches[0][1], serviceDirName, packageName);       
    }

    public static fromChangeLogPath(changelogPath: string){
        const r = changelogPath.matchAll(/^(.*)[\\/]sdk[\\/]([\w\d\.\_]+)[\\/](Azure\.ResourceManager(\.[\w\d\.\_]*)?)[\\/]CHANGELOG\.md$/gi);
        if(r === null){
            return null;
        }
        const matches = [...r];
        
        if(!this.validateRepoName(path.dirname(changelogPath))){
            return null;
        }

        return new CodeGenContext(matches[0][1], matches[0][2], matches[0][3]);
    }

    public static fromApiFilePath(apiFilePath: string){
        const r = apiFilePath.matchAll(/^(.*)[\\/]sdk[\\/]([\w\d\.\_]+)[\\/](Azure\.ResourceManager(\.[\w\d\.\_]*)?)[\\/]api[\\/]([\w\d\.\_]+)\.cs$/gi);
        if(r === null){
            return null;
        }
        const matches = [...r];
        
        if(!this.validateRepoName(path.dirname(apiFilePath))){
            return null;
        }

        return new CodeGenContext(matches[0][1], matches[0][2], matches[0][3]);
    }

    public static fromApiFolderPath(apiFolderPath: string){
        const r = apiFolderPath.matchAll(/^(.*)[\\/]sdk[\\/]([\w\d\.\_]+)[\\/](Azure\.ResourceManager(\.[\w\d\.\_]*)?)[\\/]api[\\/]?$/gi);
        if(r === null){
            return null;
        }
        const matches = [...r];

        if(!this.validateRepoName(apiFolderPath)){
            return null;
        }

        return new CodeGenContext(matches[0][1], matches[0][2], matches[0][3]);
    }

    public static fromAutorestMdPath(autorestMdPath: string){
        const r = autorestMdPath.matchAll(/^(.*)[\\/]sdk[\\/]([\w\d\.\_]+)[\\/](Azure\.ResourceManager(\.[\w\d\.\_]*)?)[\\/]src[\\/]autorest\.md$/gi);
        if(r === null){
            return null;
        }
        const matches = [...r];
        
        if(!this.validateRepoName(path.dirname(autorestMdPath))){
            return null;
        }

        return new CodeGenContext(matches[0][1], matches[0][2], matches[0][3]);
    }
};