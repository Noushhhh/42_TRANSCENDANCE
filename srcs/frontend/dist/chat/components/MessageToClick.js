"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
require("../styles/MessageToClick.css");
var RadioButtonUnchecked_1 = __importDefault(require("@mui/icons-material/RadioButtonUnchecked"));
var TimeElapsed_1 = __importDefault(require("./TimeElapsed"));
function MessageToClick(_a) {
    var channel = _a.channel, setChannelId = _a.setChannelId, channelId = _a.channelId, socket = _a.socket;
    var dateObject = new Date(channel.dateLastMsg);
    var handleClick = function () {
        setChannelId(channel.channelId);
    };
    return (react_1.default.createElement("div", { onClick: handleClick, className: "MessageToClick" },
        react_1.default.createElement("div", { className: "logoIsConnected" },
            react_1.default.createElement(RadioButtonUnchecked_1.default, null)),
        react_1.default.createElement("div", { className: "ContainerPreview" },
            react_1.default.createElement("div", { className: "MessageToClickTitle" },
                react_1.default.createElement("p", { className: "senderName" }, channel.name),
                react_1.default.createElement("p", { className: "dateMessage" }, react_1.default.createElement(TimeElapsed_1.default, { date: dateObject }))),
            react_1.default.createElement("div", { className: "ContentMessageTitle" },
                react_1.default.createElement("p", { className: "PreviewMessage" }, channel.lastMsg)))));
}
exports.default = MessageToClick;
//# sourceMappingURL=MessageToClick.js.map