import * as vscode from 'vscode';

export class Logger {
    private static output: vscode.OutputChannel = vscode.window.createOutputChannel("AzureSdkMgmtCodeGen");

    public static logVerbose(message: string, popup: boolean = false){
        Logger.output.appendLine("[Verbose] " + message);
        if(popup){
            vscode.window.showInformationMessage(message);
        }
    }

    public static logInfo(message: string, popup: boolean = false) {
        Logger.output.appendLine("[Info] " + message);
        if(popup){
            vscode.window.showInformationMessage(message);
        }
    }

    public static logWarning(message: string, popup: boolean = true) {
        Logger.output.appendLine("[Warning] " + message);
        if(popup){
            vscode.window.showWarningMessage(message);
        }
    }

    public static logError(message: string, popup: boolean = true){
        Logger.output.appendLine("[Error] " + message);
        if(popup){
            vscode.window.showErrorMessage(message);
        }
    }

    public static showLogOutput(){
        Logger.output.show();
    }
}