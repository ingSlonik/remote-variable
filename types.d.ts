export type RemoteVariable<T = any> = T;

export type VariablePrimitive = { type: "undefined", value: undefined }
    | { type: "null", value: null }
    | { type: "boolean", value: boolean }
    | { type: "number", value: number }
    | { type: "string", value: string };

export type VariableRemoteValue = { id: string, prop: null | string }; // canvas.getContext("2d") works getContext("2d") not

export type VariableRemote = { type: "remote", value: VariableRemoteValue }; // object (array) and function

export type Variable = VariablePrimitive | VariableRemote;

export type MessageRemote = { signature: "remote-variable-remote", variable: VariableRemoteValue, type: "get", eventId: string, prop: string }
    | { signature: "remote-variable-remote", variable: VariableRemoteValue, type: "set", eventId: string, prop: string, value: any }
    | { signature: "remote-variable-remote", variable: VariableRemoteValue, type: "apply", eventId: string, argArray: any[] };

export type MessageClient = { signature: "remote-variable-client", type: "access", id: string, variable: Variable }
    | { signature: "remote-variable-client", type: "return", eventId: string, variable: Variable };

export type MessageRemoteString = string;
export type MessageClientString = string;

export type PostMessage = (message: string) => void;
export type OnMessage = (on: PostMessage) => void;
