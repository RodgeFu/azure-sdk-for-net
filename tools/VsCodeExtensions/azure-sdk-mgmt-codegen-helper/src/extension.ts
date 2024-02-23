// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { runPowershellScript, startProcess } from "./util";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import { CodeGenHelper } from "./codegenHelper";
import { CodeGenContext } from "./codegenContext";
import { Logger } from './logger';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(
		'Congratulations, your extension "azure-sdk-mgmt-codegen-helper" is now active!'
	);

	const progressStatusCommandId = "azure-sdk-mgmt-codegen-helper.progress-status";
	let progressStatusCommand = vscode.commands.registerCommand(
		progressStatusCommandId, 
		() => {
			// do nothing for now
		});

	let progressStatusBarItem : vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	progressStatusBarItem.command = progressStatusCommandId;

	let createCodeGenContext = (path: string) =>{
		// should be good enough for now
		if(!path){
			return null;
		}
		else if(path.endsWith("autorest.md")){
			return CodeGenContext.fromAutorestMdPath(path);
		}
		else if(path.endsWith("CHANGELOG.md")){
			return CodeGenContext.fromChangeLogPath(path);
		}
		else if(path.endsWith("api")){
			return CodeGenContext.fromApiFolderPath(path);
		}
		else if(path.endsWith(".netstandard2.0.cs")){
			return CodeGenContext.fromApiFilePath(path);
		}
		else{
			return null;
		}
	};

	let doWorkAsync = async (workName: string, work: () => Promise<void>) => {
		try
		{
			progressStatusBarItem.text = `$(sync~spin) ${workName}...`;
			progressStatusBarItem.show();
			Logger.showLogOutput();
			Logger.logInfo(`Start ${workName}...`);
			await work();
			Logger.logInfo(`Finish ${workName}. Check Output log for details.`, true /*popup*/);
		}
		catch(error){
			Logger.logError(`Error occurs when ${workName}: ${error}`);
		}
		finally
		{
			progressStatusBarItem.hide();
		}
	};


	let regenDisposible = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.regenerate-code",
		async (context: any) => {
			const cg = createCodeGenContext(context.fsPath);
			if (!cg) {
				Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
				return;
			}
			await doWorkAsync("generating code", async () => { await CodeGenHelper.generateCode(cg); });
		});

	let regenLatestDisposable = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.regenerate-code-with-latest-spec",
		async (context: any) => {
			const cg = createCodeGenContext(context.fsPath);
			if (!cg) {
				Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
				return;
			}
			await doWorkAsync("generating code with latest spec", async () => { await CodeGenHelper.generateCodeWithLatestSpec(cg); });
		}
	);

	let regenApiFileDisposiable = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.regenerate-api-file",
		async (context: any) => {
			const cg = createCodeGenContext(context.fsPath);
			if (!cg) {
				Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
				return;
			}
			await doWorkAsync("generating api file", async () => { await CodeGenHelper.generateApiFile(cg); });
		});

	let updateChangelogDisposiable = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.update-changelog",
		async (context: any) => {
			const cg = createCodeGenContext(context.fsPath);
			if (!cg) {
				Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
				return;
			}
			await doWorkAsync("updating changelog", async () => { await CodeGenHelper.updateChangeLog(cg); });
		});

	let createNewServiceDisposiable = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.init-new-service",
		async (context: any) => {
			if(context?.fsPath && context.fsPath.endsWith("sdk")){
				await doWorkAsync("initializing new service", async () => { await CodeGenHelper.initNewSdk(context.fsPath); });
			}
			else{
				Logger.logError(`Unexpected fsPath: ${context.fsPath}.`);
			}
		});

	context.subscriptions.push(
		regenDisposible, 
		regenLatestDisposable, 
		regenApiFileDisposiable, 
		updateChangelogDisposiable, 
		createNewServiceDisposiable,
		progressStatusCommand,
		progressStatusBarItem);
}

// This method is called when your extension is deactivated
export function deactivate() { }
