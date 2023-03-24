let ctx: Worker = self as any;

import * as createClangdModule from "./clangd";

type Module = {
    FS: any;
    preRun(): void;
    locateFile(path: string, prefix: string): string;
    mainScriptUrlOrBlob: string;

    messageBuf: object[];
}

let outputMessageBuf: number[] = [];
let outputMessageLength: null | number = null;

let stderrBuf: number[] = [];

let Module: Module = {
    FS: null,

    preRun() {
        let stdin = function (): number | null {
            return null;
        }

        let stdout = function (inByte: number) {
            // We handle things byte by byte instead of character by character
            // to make sure we're unicode friendly
            outputMessageBuf.push(inByte);

            let outputMessageString;
            try {
                outputMessageString = new TextDecoder().decode(new Uint8Array(outputMessageBuf));
            } catch {
                // We're in the middle of receiving a multi-byte character.
                return;
            }

            if (outputMessageLength == null) {
                // Receiving headers
                if (outputMessageString.endsWith("\r\n\r\n")) {
                    outputMessageLength = parseInt(outputMessageString.split(":")[1].trim());
                    outputMessageBuf = [];
                }
            } else {
                if (outputMessageBuf.length == outputMessageLength) {
                    // message time!
                    ctx.postMessage(outputMessageString);
                    outputMessageBuf = [];
                    outputMessageLength = null;
                }
            }
        }

        let stderr = function (outByte: number) {
            stderrBuf.push(outByte);
            
            let stderrString;
            try {
                stderrString = new TextDecoder().decode(new Uint8Array(stderrBuf));
            } catch {
                // We're in the middle of receiving a multi-byte character.
                return;
            }

            if (stderrString.endsWith("\n")) { // \n
                console.warn(stderrString);
                stderrBuf = [];
            }
        }

        Module.FS.init(stdin, stdout, stderr);
    },

    locateFile(path, prefix) {
        if (path.endsWith(".worker.js"))
            return new URL("./clangd.worker.js", import.meta.url).toString();
    
        return path;    
    },

    mainScriptUrlOrBlob: new URL('./clangd.js', import.meta.url).toString(),

    messageBuf: [],
};

ctx.onmessage = ({ data }) => {
    Module.messageBuf.push(data);
}

createClangdModule(Module);