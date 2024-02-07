// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { spawn } from "child_process";
import path from "path";
import axios, { get } from "axios";
import { readFileSync, writeFileSync } from "fs";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(
		'Congratulations, your extension "azure-sdk-mgmt-codegen-helper" is now active!'
	);

	let disposable = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.regenerate-code",
		(context: any) => {
			let output = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");
			output.show();
			output.appendLine("Generate code...");

			let folder = path.dirname(context.fsPath);
			dotnetBuildGenerateCode(folder, output, (code) => {vscode.window.showInformationMessage("Code generation completed. Check OUTPUT for details.");});
		});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable1 = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.regenerate-code-with-latest-spec",
		(context: any) => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			let output = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");
			output.show();
			output.appendLine("Generate code with latest azure-rest-api-spec...");

			getLatestCommitIdFromGitHub("Azure", "azure-rest-api-specs", "main").then(
				(value) =>{
					try{
						output.appendLine("Update azure-rest-api-specs to latest commit id: " + value);
						const autorestMd = readFileSync(context.fsPath, 'utf-8');
						const newAutorestMd = autorestMd.replace(/(https:\/\/github\.com\/Azure\/azure-rest-api-specs\/blob\/)([\w\d]+)(\/specification\/.+)/gi,
						`$1${value}$3`);
						writeFileSync(context.fsPath, newAutorestMd, 'utf-8');
						let folder = path.dirname(context.fsPath);
						dotnetBuildGenerateCode(folder, output, (code) => {vscode.window.showInformationMessage("Code generation completed. Check OUTPUT for details.");});
					}
					catch(error){
						vscode.window.showErrorMessage(
							"Unexpected error: " + error
						);
					}
				},
				(reason) => {
					vscode.window.showErrorMessage(
						"Error fetching latest commit id: " + reason
					);
				}
			);
		}
	);

	let disposiable2 = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.regenerate-api-file",
		(context: any) => {
			let output = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");
			output.show();
			output.appendLine("Regenerate api file...");
			
			let folder = path.dirname(context.fsPath);
			const info = parseAutorestMdPath(context.fsPath);
			if(!info.isMatch){
				vscode.window.showErrorMessage(
					"Invalid autorest.md file path: " + context.fsPath
				);
			}
			else{
				const genApiScript = path.join(info.repoRootPath, "eng", "scripts", "Export-API.ps1");
				runPowershellScript(genApiScript, [info.serviceName], folder, output, (code) => {vscode.window.showInformationMessage("API file generation completed. Check OUTPUT for details.");});
			}
		});

	let disposiable3 = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.update-changelog",
		async (context: any) =>{
			let output = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");
			output.show();
			output.appendLine("Update changelog...");

			let folder = path.dirname(context.fsPath);
			const info = parseAutorestMdPath(context.fsPath);
			if(!info.isMatch){
				vscode.window.showErrorMessage(
					"Invalid autorest.md file path: " + context.fsPath
				);
			}
			else{
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
						if(value.match(/^\d{4}-\d{2}-\d{2}$/)){
							return null;
						}
						return "Invalid date format. Please enter date in format: yyyy-MM-dd";
					}
				});

				if(version === undefined || releaseDate === undefined){
					output.appendLine("Updating changelog cancelled.");
					vscode.window.showInformationMessage("Updating changelog cancelled.");
				}
				else{
					const genApiScript = path.join(info.repoRootPath, "eng", "scripts", "Gen-Mgmt-Changelog.ps1");
					runPowershellScript(genApiScript, [info.serviceName, version, releaseDate], folder, output, (code) => {vscode.window.showInformationMessage("Changelog update completed. Check OUTPUT for details.");});
				}
			}
		});

	context.subscriptions.push(disposable, disposable1, disposiable2, disposiable3);
}

function parseAutorestMdPath(autorestMdPath: string): { isMatch: boolean, repoRootPath: string, serviceName: string } {
	const r = autorestMdPath.matchAll(/^(.*)[\\/]sdk[\\/]([\w\d\.\_]+)[\\/]Azure\.ResourceManager(\.[\w\d\.\_]*)?[\\/]src[\\/]autorest\.md$/gi);
	if(r === null){
		return { isMatch: false, repoRootPath: "", serviceName: "" };
	}
	const matches = [...r];
	return {
		isMatch: true,
		repoRootPath: matches[0][1],
		serviceName: matches[0][2]
	};
}

function runPowershellScript(scriptPath: string, args: string[], workFolder: string, output: vscode.OutputChannel, onClose: ((code: any) => void) | undefined = undefined){
	startProcess("pwsh", ["-file", scriptPath, ...args], workFolder, output, "ps", onClose);
}

function dotnetBuildGenerateCode(folder: string, output: vscode.OutputChannel, onClose: ((code: any) => void) | undefined = undefined){
	startProcess("dotnet", ["build", "/t:GenerateCode"], folder, output, "codegen", onClose);
}

function startProcess(exe: string, args: string[], workFolder: string, output: vscode.OutputChannel, logGroup: string, onClose: ((code: any) => void) | undefined = undefined) {
	output.appendLine(`Start running: "${exe} ${args.map(s => `'${s}'`).join(" ")}" in ${workFolder}...`);
	const dn = spawn(exe, [...args], { cwd: workFolder});

	dn.stdout.on("data", (data) => {
		output.appendLine(`${logGroup}: ${data}`.trim());
	});

	dn.stderr.on("data", (data) => {
		output.appendLine(`${logGroup}-error: ${data}`.trim());
	});

	dn.on("close", (code) => {
		output.appendLine(`${logGroup}: exit code:${code}`.trim());
		if(onClose){
			onClose(code);
		}
	});
}

async function getLatestCommitIdFromGitHub(
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
			console.error("Error fetching commit ID:", response.statusText);
			return null;
		}
	} catch (error:any) {
		console.error("Error fetching commit ID:", error.message);
		return null;
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
