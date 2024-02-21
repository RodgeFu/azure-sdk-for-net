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

	let createCodeGenContext = (path: string) =>{
		// should be good enough for now
		if(path.endsWith("autorest.md")){
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

	let regenDisposible = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.regenerate-code",
		(context: any) => {
			const cg = createCodeGenContext(context.fsPath);
			if (!cg) {
				Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
				return;
			}
			CodeGenHelper.generateCode(cg);
		});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let regenLatestDisposable = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.regenerate-code-with-latest-spec",
		(context: any) => {
			const cg = createCodeGenContext(context.fsPath);
			if (!cg) {
				Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
				return;
			}
			CodeGenHelper.generateCodeWithLatestSpec(cg);
		}
	);

	let regenApiFileDisposiable = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.regenerate-api-file",
		(context: any) => {
			const cg = createCodeGenContext(context.fsPath);
			if (!cg) {
				Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
				return;
			}
			CodeGenHelper.generateApiFile(cg);
		});

	let updateChangelogDisposiable = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.update-changelog",
		async (context: any) => {
			const cg = createCodeGenContext(context.fsPath);
			if (!cg) {
				Logger.logError(`Unexpected Error: Failed to initialize context from path ${context.fsPath}.`);
				return;
			}
			await CodeGenHelper.updateChangeLog(cg);
		});

	let createNewServiceDisposiable = vscode.commands.registerCommand(
		"azure-sdk-mgmt-codegen-helper.init-new-service",
		async (context: any) => {
			await CodeGenHelper.initNewSdk(context.fsPath);
		});

	context.subscriptions.push(regenDisposible, regenLatestDisposable, regenApiFileDisposiable, updateChangelogDisposiable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
