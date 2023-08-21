import * as vscode from 'vscode';
import * as path from 'path';
import treeMaker from './makeTree';
import { promises as fs } from 'fs';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "next-extension" is now active!');

  let disposable = vscode.commands.registerCommand('next-extension.helloWorld', async () => {
    const webview = vscode.window.createWebviewPanel(
      'reactWebview',
      'React Webview',
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    webview.webview.onDidReceiveMessage(
      async message => {
        switch (message.command) {
          case 'getRequest':
            const { src, app } = message;
            const result = await treeMaker(src, app);
            const sendString = JSON.stringify(result);
            vscode.window.showInformationMessage(sendString);
            webview.webview.postMessage({command: 'sendString', data: sendString});
            break;
        }
      },
      undefined, //this value for event listener
      context.subscriptions
    );

    // const scriptPathOnDisk = vscode.Uri.file(
    //   path.join(context.extensionPath, 'webview-react-app', 'dist', 'bundle.js')
    // );
    // const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

    // Read the content of the bundle.js file and insert it directly into the script tag
    try {
      const bundlePath = path.join(context.extensionPath, 'webview-react-app', 'dist', 'bundle.js');
      const bundleContent = await fs.readFile(bundlePath, 'utf-8');
      webview.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>React Webview</title>
        </head>
        <body>
          <div id="root"></div>
          <script>
          ${bundleContent}
          </script>
        </body>
        </html>`;
    } catch (err) {
      console.error('Error reading bundle.js:', err);
    }
    vscode.window.showInformationMessage('Hello, World!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
