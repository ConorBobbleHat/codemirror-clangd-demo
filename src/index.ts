import { basicSetup } from "codemirror"
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { lintGutter } from "@codemirror/lint";
import { autocompletion } from "@codemirror/autocomplete";
import { cpp } from "@codemirror/lang-cpp"

import { languageServerWithTransport } from 'codemirror-languageserver'
import PostMessageWorkerTransport from "./postMessageWorkerTransport";

const ls = languageServerWithTransport({
	transport: new PostMessageWorkerTransport(new Worker(new URL('./lsp.worker.ts', import.meta.url))) as any,
	rootUri: "file:///",
	workspaceFolders: null,
	documentUri: `file:///test.cpp`,
	languageId: "cpp",
})

const fullscreenEditor = EditorView.theme({
	"&": { height: "100%" },
	".cm-scroller": { overflow: "auto" }
})

let editor = new EditorView({
	extensions: [basicSetup, fullscreenEditor, cpp(), lintGutter(), ls, autocompletion(), keymap.of([indentWithTab])],
	parent: document.body,
	doc: 'int main()\n{\n  return "something that\'s *definitely* not an int";\n}',
})