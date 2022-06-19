import { resolve } from "path";
import NativeWebView from "native-webview";

import { connectRemoteVariable, PostMessage, OnMessage } from "../src/index";

const onMessages: PostMessage[] = [];

const nwv = new NativeWebView({
    title: "Remove variable example - Canvas",
    getPath(src) {
        const path = resolve(__dirname, src);
        console.log("File:", src, "=>", path);
        return path;
    },
    onMessage(message: string) {
        if (message === "Client loaded") {
            const postMessage: PostMessage = (message) => nwv.eval(`onMessage(${JSON.stringify(message)})`);
            const onMessage: OnMessage = (receiveMessage) => onMessages.push(receiveMessage);

            runExample(postMessage, onMessage);
            postMessage("Remote loaded");
        }

        onMessages.forEach(on => on(message));
    }
});

nwv.run();

async function runExample(postMessage: PostMessage, onMessage: OnMessage) {
    const [canvas] = await connectRemoteVariable<HTMLCanvasElement>("canvas", postMessage, onMessage);

    const ctx = canvas.getContext("2d");

    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(300, 150);
        ctx.stroke();
    }
}
