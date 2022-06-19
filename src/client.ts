import { parseMessageRemote, stringifyMessageClient } from "./common";
import { OnMessage, PostMessage, VariableRemote, Variable } from "../types";

// variable event unique
let variableIndex = 0;

// TODO: garbage
const variables: { [id: string]: any } = {};

function getUniqueVariableId(): string {
    variableIndex++;
    return `var-${variableIndex}`;
}

function getVariable(value: any, id?: string): Variable {
    switch (typeof value) {
        case "undefined": return { type: "undefined", value };
        case "boolean": return { type: "boolean", value };
        case "number": return { type: "number", value };
        case "bigint": return { type: "number", value: Number(value) };
        case "string": return { type: "string", value };
        case "symbol": return { type: "string", value: String(value) };
        case "function": return getRemoteVariable(value, id);
        case "object": return value === null ? { type: "null", value } : getRemoteVariable(value, id);
    }
}

function getRemoteVariable(value: any, id?: string): VariableRemote {
    if (!id) id = getUniqueVariableId();
    if (!(id in variables)) variables[id] = value;

    return { type: "remote", value: { id, prop: null } };
}

function getVariableFromId(id: string): any {
    if (id in variables) {
        return variables[id];
    } else {
        throw new Error(`Variable "${id}" is not set.`);
    }
}

function returnEvent(variable: Variable, eventId: string, postMessage: PostMessage) {
    postMessage(stringifyMessageClient({ signature: "remote-variable-client", type: "return", eventId, variable }));
}

function onMessageProcess(messageString: string, postMessage: PostMessage) {
    const message = parseMessageRemote(messageString);
    if (message === null) return;

    const { variable } = message;
    const value = getVariableFromId(variable.id);

    // variable is RemoteVariable
    switch (message.type) {
        case "apply":
            return variable.prop ?
                returnEvent(getVariable(value[variable.prop](...message.argArray)), message.eventId, postMessage) :
                returnEvent(getVariable(value(...message.argArray)), message.eventId, postMessage);
        case "get":
            const returnValue = value[message.prop];
            return typeof returnValue === "function" ?
                returnEvent({ type: "remote", value: { id: message.variable.id, prop: message.prop } }, message.eventId, postMessage) :
                returnEvent(getVariable(returnValue), message.eventId, postMessage);
        case "set": return returnEvent(getVariable(value[message.prop] = message.value), message.eventId, postMessage);
    }
}

export function accessVariables(id: string, value: any, postMessage: PostMessage, onMessage: OnMessage) {
    // TODO: only once
    onMessage(messageString => onMessageProcess(messageString, postMessage));

    postMessage(stringifyMessageClient({ signature: "remote-variable-client", type: "access", id, variable: getVariable(value, id) }));
}
