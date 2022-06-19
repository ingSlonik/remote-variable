import { loopWhile } from "deasync";

import { parseMessageClient, stringifyMessageRemote } from "./common";
import { MessageRemote, OnMessage, PostMessage, RemoteVariable, Variable, VariablePrimitive } from "../types";

export type { PostMessage, OnMessage } from "../types";

// every event unique
let eventIndex = 0;

function getUniqueEventId(): string {
    eventIndex++;
    return `ev-${eventIndex}`;
}

function isPrimitive(variable: Variable): variable is VariablePrimitive {
    return variable.type !== "remote";
}

function getVariable<V extends Variable>(variable: V, postMessage: PostMessage, onMessage: OnMessage): RemoteVariable {
    if (isPrimitive(variable)) {
        return variable.value;
    } else {
        return createRemoteVariable(variable.value.id, variable.value.prop, postMessage, onMessage);
    }
}

function handleEventSync(messageRemote: MessageRemote, postMessage: PostMessage, onMessage: OnMessage): RemoteVariable {
    let done = false;
    let variable;

    onMessage((messageString) => {
        const message = parseMessageClient(messageString);
        if (message === null) return;

        if (message.type === "return" && message.eventId === messageRemote.eventId) {
            variable = getVariable(message.variable, postMessage, onMessage);
            done = true;
        }
    });

    postMessage(stringifyMessageRemote(messageRemote));

    loopWhile(() => !done);

    return variable;
}

function createRemoteVariable(id: string, prop: null | string, postMessage: PostMessage, onMessage: OnMessage) {
    const target = function () { };
    target.__remoteVariableId = id;
    const handler: ProxyHandler<any> = {
        apply(target, thisArg, argArray) {
            const eventId = getUniqueEventId();
            const variable = handleEventSync({ signature: "remote-variable-remote", variable: { id, prop }, type: "apply", eventId, argArray }, postMessage, onMessage);
            return variable;
        },
        get(target, getProp, receiver) {
            const eventId = getUniqueEventId();
            const variable = handleEventSync({ signature: "remote-variable-remote", variable: { id, prop }, type: "get", eventId, prop: String(getProp) }, postMessage, onMessage);
            return variable;
        },
        set(target, setProp, value, receiver) {
            const eventId = getUniqueEventId();
            try {
                handleEventSync({ signature: "remote-variable-remote", variable: { id, prop }, type: "set", eventId, prop: String(setProp), value }, postMessage, onMessage);
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    return new Proxy<any>(target, handler);
}

export function onRemoteVariable(postMessage: PostMessage, onMessage: OnMessage, callback: (id: string, variable: any) => void) {
    onMessage(messageString => {
        const message = parseMessageClient(messageString);
        if (message === null) return;
        switch (message.type) {
            case "access":
                return callback(message.id, getVariable(message.variable, postMessage, onMessage));
        }
    });
}

export async function connectRemoteVariable<T>(id: string, postMessage: PostMessage, onMessage: OnMessage): Promise<[T]> {
    return new Promise((resolve, reject) => {
        onRemoteVariable(postMessage, onMessage, (accessId, variable) => {
            if (accessId === id) {
                resolve([variable]);
            }

            // TODO: timeout?
        });
    });
}
