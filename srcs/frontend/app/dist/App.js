"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
require("./App.css");
var navbar_1 = __importDefault(require("./navbar/navbar"));
var ChatBoxContainer_1 = __importDefault(require("./chat/components/ChatBoxContainer"));
function App() {
    return (react_1.default.createElement("div", { className: "App" },
        react_1.default.createElement(navbar_1.default, null),
        react_1.default.createElement(ChatBoxContainer_1.default, null)));
}
exports.default = App;
//# sourceMappingURL=App.js.map