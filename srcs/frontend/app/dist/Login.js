"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function App() {
    (0, react_1.useEffect)(function () {
        fetch('/api/status')
            .then(function (response) { return response.json(); })
            .then(function (data) { return console.log(data); })
            .catch(function (err) { return console.log(err); });
    }, []);
    // rest of your component...
}
exports.default = App;
//# sourceMappingURL=Login.js.map