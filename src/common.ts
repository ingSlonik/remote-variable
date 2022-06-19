import { MessageRemote, MessageRemoteString, MessageClient, MessageClientString } from "./types";


export function stringifyMessageRemote(message: MessageRemote): MessageRemoteString {
    return JSON.stringify(message);
}
export function parseMessageRemote(message: string): null | MessageRemote {
    try {
        const m = JSON.parse(message);
        if (m !== null && typeof m === "object" && m.signature === "remote-variable-remote")
            return m;
    } catch (e) { }

    return null;
}

export function stringifyMessageClient(message: MessageClient): MessageClientString {
    return JSON.stringify(message);
}
export function parseMessageClient(message: string): null | MessageClient {
    try {
        const m = JSON.parse(message);

        if (m !== null && typeof m === "object" && m.signature === "remote-variable-client")
            return m;
    } catch (e) { }

    return null;
}
