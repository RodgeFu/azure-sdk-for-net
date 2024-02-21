import * as vscode from 'vscode';

export class Logger {
    private static output: vscode.OutputChannel = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");

    public static logVerbose(message: string){
        Logger.output.appendLine("[Verbose] " + message);
    }

    public static logInfo(message: string) {
        Logger.output.appendLine("[Info] " + message);
    }

    public static logWarning(message: string) {
        Logger.output.appendLine("[Warning] " + message);
        vscode.window.showWarningMessage(message);
    }

    public static logError(message: string){
        Logger.output.appendLine("[Error] " + message);
        vscode.window.showErrorMessage(message);
    }

    public static showLogOutput(){
        Logger.output.show();
    }
}