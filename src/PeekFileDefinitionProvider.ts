import * as vscode from "vscode";

export default class PeekFileDefinitionProvider implements vscode.DefinitionProvider {
  targetFiles: string[] = [];
  resourcePagePaths: string[] = [];

  constructor(targetFiles: string[] = [], resourcePagePaths: string[] = []) {
    this.targetFiles = targetFiles;
    this.resourcePagePaths = resourcePagePaths;
  }

  getResourceName(document: vscode.TextDocument, position: vscode.Position): String[] {
    // only provide definition if the current file is a target file
    if (!this.targetFiles.includes(document.fileName.split("/").slice(-1).join())) return [];

    // get the string we are looking at via a regex
    const range = document.getWordRangeAtPosition(
      position,
      /((route|get|delete|head|options|patch|post|put)?\(?['"]([^'"]*?)['"])/,
    );
    if (range === undefined) {
      return [];
    }

    const selectedText = document.getText(range);

    // get the name of the resource
    const resourceParts = selectedText.match(/((route|get|delete|head|options|patch|post|put)?\(?['"]([^'"]*?)['"])/);

    if (resourceParts === null) {
      return [];
    }

    const routeName = resourceParts[3];
    const possibleFileNames: String[] = [];

    // "/foo/bar" => "/Foo/Bar"
    // "/foo-bar" => "/FooBar"
    const tryFileBase = routeName
      .split("/")
      .map((x) => {
        if (x.includes("-")) {
          return x
            .split("-")
            .map((dashed) => dashed.charAt(0).toUpperCase() + dashed.slice(1))
            .join("");
        } else {
          return x.charAt(0).toUpperCase() + x.slice(1);
        }
      })
      .join("/");

    // add all possible file paths to the array
    this.resourcePagePaths.forEach((resourcePagePath) => {
      possibleFileNames.push(`${resourcePagePath}${tryFileBase}.php`);
    });

    return possibleFileNames;
  }

  searchFilePath(fileName: String): Thenable<vscode.Uri[]> {
    return vscode.workspace.findFiles(`**/${fileName}`, "**/vendor"); // Returns promise
  }

  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): Promise<any[] | vscode.Location | vscode.Location[] | undefined> {
    const resourceNames = this.getResourceName(document, position);
    const searchPathActions = resourceNames.map(this.searchFilePath);
    const searchPromises = Promise.all(searchPathActions); // pass array of promises
    const paths = await searchPromises;

    // @ts-ignore
    const filePaths: any[] = [].concat.apply([], paths);
    if (!filePaths.length) {
      return undefined;
    }

    const allPaths: any[] = [];
    filePaths.forEach((filePath) => {
      allPaths.push(new vscode.Location(vscode.Uri.file(filePath.path), new vscode.Position(0, 0)));
    });

    return allPaths;
  }
}
