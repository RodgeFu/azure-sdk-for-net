import * as vscode from "vscode";
import { execSync, spawn, spawnSync } from "child_process";
import axios, { get } from "axios";
import { Logger } from "./logger";
import path from "path";
import { CodeGenContext } from "./codegenContext";
import { readFileSync } from "fs";

//#region codegen utils
export function dotnetBuildGenerateCode(autorestMdPath: string, expectedExitCode: number = 0) : Promise<number>{
    const srcFolder = path.dirname(autorestMdPath);
	return startProcess("dotnet", ["build", "/t:GenerateCode"], srcFolder, "codegen", expectedExitCode);
}
//#endregion

//#region process utils
export function runPowershellScript(scriptPath: string, args: string[], workFolder: string, expectedExitCode: number = 0): Promise<number>{
	return startProcess("pwsh", ["-file", scriptPath, ...args], workFolder, "ps", expectedExitCode);
}

export function startProcess(exe: string, args: string[], workFolder: string, logName: string, expectedExitCode: number = 0): Promise<number> {

	return new Promise((resolve, reject) => {
		Logger.logVerbose(`Start running: "${exe} ${args.map(s => `'${s}'`).join(" ")}" in ${workFolder}...`);
		const dn = spawn(exe, [...args], { cwd: workFolder});

		const logPre = logName ? `${logName}: ` : "";
		dn.stdout.on("data", (data) => {
			Logger.logVerbose(`${logPre}${data}`.trim());
		});

		dn.stderr.on("data", (data) => {
			Logger.logError(`${logPre}${data}`.trim());
		});

		dn.on("close", (code) => {
			Logger.logVerbose(`${logPre}exit code:${code}`.trim());
			if(code === expectedExitCode){
				resolve(code);
			}
			else{
				reject("Process failed with exit code: " + code);
			}
		});
	});
}
//#endregion

//#region git utils
export async function getLatestCommitIdFromGitHub(
	username: string,
	repoName: string,
	branchName: string
): Promise<string | null> {
	try {
		const response = await axios.get(
			`https://api.github.com/repos/${username}/${repoName}/branches/${branchName}`
		);

		if (response.status === 200 && response.data?.commit?.sha) {
			return response.data.commit.sha;
		} else {
            Logger.logError(`Error fetching commit ID: ${response.statusText}`);
			return null;
		}
	} catch (error:any) {
        Logger.logError(`Error fetching commit ID: ${error.message}`);
		return null;
	}
}

export function getGitRoot(cwd: string): string | null {
	
    try {
        const gitRoot = execSync('git rev-parse --show-toplevel', { cwd: cwd, encoding: 'utf-8' }).trim();
        return gitRoot;
    } catch (error) {
        Logger.logError(`Error fetching git root: ${error}`);
        return null;
    }
}

export function getRemoteRepoName(cwd: string): string | null {
    try {
		const remoteUrl = execSync('git config --get remote.origin.url', { cwd: cwd, encoding: 'utf-8' }).trim();
        const repoName = remoteUrl.split('/').pop()?.replace('.git', '') || null;
        return repoName;
    } catch (error) {
        Logger.logError(`Error fetching remote repo name: ${error}`);
        return null;
    }
}
//endregion