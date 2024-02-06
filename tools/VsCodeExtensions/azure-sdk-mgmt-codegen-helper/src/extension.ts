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

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.helloWorld",
		(context: any) => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			let output = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");
			output.show();
			output.appendLine("Retriving latest azure-rest-api-spec...");

			getLatestCommitIdFromGitHub("Azure", "azure-rest-api-specs", "main").then(
				(value) =>{
					try{
						output.appendLine("Update azure-rest-api-specs to latest commit id: " + value);
						const autorestMd = readFileSync(context.fsPath, 'utf-8');
						const newAutorestMd = autorestMd.replace(/(https:\/\/github\.com\/Azure\/azure-rest-api-specs\/blob\/)([\w\d]+)(\/specification\/.+)/gi,
						`$1${value}$3`);
						writeFileSync(context.fsPath, newAutorestMd, 'utf-8');
						let folder = path.dirname(context.fsPath);
						output.appendLine("Start generating code using latest azure-rest-api-specs from " + folder);
						dotnetBuildGenerateCode(folder, output);
						output.appendLine("Code generation completed.");
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

			vscode.window.showInformationMessage(
				"Hello World from AzureSdkMgmtCodeGenHelper!"
			);
		}
	);

	context.subscriptions.push(disposable);
}

function dotnetBuildGenerateCode(folder: string, output: vscode.OutputChannel){
	const dn = spawn("dotnet", ["build", "/t:GenerateCode"], { cwd: folder });

	dn.stdout.on("data", (data) => {
		output.appendLine(`codegen: ${data}`.trim());
	});

	dn.stderr.on("data", (data) => {
		output.appendLine(`codegen-error: ${data}`.trim());
	});

	dn.on("close", (code) => {
		output.appendLine(`codegen: exit code:${code}`.trim());
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
