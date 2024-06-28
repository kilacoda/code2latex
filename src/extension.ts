'use strict';
import * as vscode from 'vscode';

// Create a new editor tab to place the LaTeX in.
async function openInUntitled(content: string, language?: string): Promise<void> {
    const document = await vscode.workspace.openTextDocument({
        language,
        content,
    });
    vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);
}

function getLatexCode(editor: vscode.TextEditor, mergeCodeChunks: boolean = false) {
    const fileLanguage = editor?.document.languageId;
    const selections = editor?.selections;
    const selectionTexts = selections.map((selection) => getSingleSelectionText(selection, editor));

    let joinedTexts = "";

    if (mergeCodeChunks) {
        joinedTexts = `
    \\begin{minted}{${fileLanguage}}
${selectionTexts.join("\n")}
    \\end{minted}
    `;

    } else {
        joinedTexts = selectionTexts.map((selectedText: String) => `
    \\begin{minted}{${fileLanguage}}
${selectedText}
    \\end{minted}
    `).join("\n");
    }

    // using the minted package for now.
    // TODO: Look into using other code listing packages as well.
    // TODO: Maybe add customization options?
    return `\\documentclass{article}

\\usepackage{minted}

\\begin{document}
${joinedTexts}
\\end{document}
`;
}

const codeToLatexPreview = async (mergeCodeChunks: boolean) => {
    const editor = vscode.window.activeTextEditor; // get current editor
    const selections = editor?.selections;           // selected text as a vscode.Selection object
    let latexCode = "";
    // get selection text
    if (selections) {
        latexCode = getLatexCode(editor, mergeCodeChunks);
        openInUntitled(latexCode, "latex");
    } else {
        vscode.window.showErrorMessage("No text selected");
    }

};

function getSingleSelectionText(selection: vscode.Selection, editor: vscode.TextEditor) {
    const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
    const highlighted = editor.document.getText(selectionRange);
    return highlighted;
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('code2latex.showSelectedTextAsLatexNonMerged', () => codeToLatexPreview(false))
    )
    context.subscriptions.push(
        vscode.commands.registerCommand('code2latex.showSelectedTextAsLatexMerged', () => codeToLatexPreview(true))
    )
}

export function deactivate() { }
