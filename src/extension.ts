// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	vscode.chat.createChatParticipant('vscode-spring-chat', async (request, context, response, token) => {
		const userPrompt = request.prompt;
		response.progress('Collecting information about your project...');

		// assign to a constant the response from the user
		const models = await vscode.lm.selectChatModels({family: 'gpt-4o'});
		const messages = [
			vscode.LanguageModelChatMessage.User(
				'You should suggest a sample Springboot application code that begins with ```java and ends with ```'),
			vscode.LanguageModelChatMessage.User(userPrompt)
		];

		const chatRequest = await models[0].sendRequest(messages, undefined, token);

		let tokens = '';
		for await (const token of chatRequest.text) {
			// response.markdown(token);
			tokens += token;
		}
		const codeRegexp = /```[^\n]*\n([\s\S]*)\n```/g;
		const code = codeRegexp.exec(tokens);
		if (code && code[1]) {
			response.markdown('```java\n' + code[1] + '\n```');
			
			response.button({
				title: 'Show code in editor',
				command: 'vscode-spring-chat.showCodeInEditor',
				arguments: [code[1]]
			});
		}
		vscode.commands.registerCommand('vscode-spring-chat.showCodeInEditor', async (code: string) => {
			 // Open the document
			 const templatePreviewDocument: vscode.TextDocument = await vscode.workspace.openTextDocument({
				language: 'java',
				content: `${code}`
			});
			const tdependencyUpdatesTextEditor = await vscode.window.showTextDocument(templatePreviewDocument, vscode.ViewColumn.Active);
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
