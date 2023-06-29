"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
require("../styles/Message.css");
function MessageComponent(props) {
    var updatedClassName = "".concat(props.messageType);
    var updatedClassNameContainer = props.messageType + "Container";
    return (react_1.default.createElement("div", { className: "Message Date ".concat(updatedClassNameContainer) },
        react_1.default.createElement("p", { className: "MessageComposant DateComposant ".concat(updatedClassName) },
            props.channelId,
            props.contentMessage)));
}
exports.default = MessageComponent;
//# sourceMappingURL=Message.js.map