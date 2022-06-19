# Remote variable

Work with variable from another worker, process or javascript environment as with your variable.

## Usage

```js
import { onRemoteVariable, connectRemoteVariable } from "remote-variable";

onRemoteVariable(postMessage, onMessage, (id, remoteVariable) => {
    if (id === "document") document = remoteVariable as Document;
});
// or
const [document] = await connectRemoteVariable<Document>("document", postMessage, onMessage);

// now you can draw to remote canvas from nodejs
const canvas = document.getElementById("my-canvas");
...
```

```js
import { accessVariables } from "remote-variable/client";

accessVariables("document", document, postMessage, onMessage);
```
## Examples

    $ npm run examples -- examples/canvas.ts

