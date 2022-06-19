const { accessVariables } = require("../lib/client");

const onMessages = [];

global.onMessage = (message) => {
    if (message === "Remote loaded") {
        const onMessage = (receiveMessage) => onMessages.push(receiveMessage);

        const canvas = document.getElementById("canvas");
        accessVariables("canvas", canvas, sendMessage, onMessage);
    }

    onMessages.forEach(on => on(message));
}

sendMessage("Client loaded");
