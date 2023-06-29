"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var socket_io_client_1 = require("socket.io-client");
require("../styles/ChatBoxContainer.css");
var MessageSide_1 = __importDefault(require("./MessageSide"));
var ContentMessage_1 = __importDefault(require("./ContentMessage"));
var SimulateUserId_1 = __importDefault(require("./SimulateUserId"));
require("../types/type.Message");
var socket = (0, socket_io_client_1.io)("http://localhost:4000");
function ChatBoxContainer() {
    var _a = (0, react_1.useState)(2), simulatedUserId = _a[0], setSimulatedUserId = _a[1];
    var _b = (0, react_1.useState)(1), selectedConversation = _b[0], setConversationList = _b[1];
    var _c = (0, react_1.useState)(11), channelId = _c[0], setChannelId = _c[1];
    socket.on('connect', function () {
        console.log("before emitting :");
        console.log(simulatedUserId);
        socket.emit('connection', simulatedUserId);
    });
    socket.on('simulatedUserId', function (unautre) {
        console.log('Received simulatedUserId:', unautre);
    });
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(SimulateUserId_1.default, { setSimulatedUserId: setSimulatedUserId }),
        react_1.default.createElement("div", { className: "ChatBoxContainer" },
            react_1.default.createElement("div", { className: "MessageContainer" },
                react_1.default.createElement(MessageSide_1.default, { simulatedUserId: simulatedUserId, setChannelId: setChannelId, channelId: channelId, socket: socket }),
                react_1.default.createElement(ContentMessage_1.default, { userId: simulatedUserId, socket: socket, simulatedUserId: simulatedUserId, conversation: selectedConversation, channelId: channelId })))));
}
exports.default = ChatBoxContainer;
//# sourceMappingURL=ChatBoxContainer.js.map