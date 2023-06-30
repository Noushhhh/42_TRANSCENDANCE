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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var HeaderChatBox_1 = __importDefault(require("./HeaderChatBox"));
var ChatView_1 = __importDefault(require("./ChatView"));
var ChatPrompt_1 = __importDefault(require("./ChatPrompt"));
var react_2 = require("react");
require("../styles/ContentMessage.css");
require("../types/type.Message");
function ContentMessage(_a) {
    var conversation = _a.conversation, channelId = _a.channelId, simulatedUserId = _a.simulatedUserId, socket = _a.socket, userId = _a.userId;
    // useState that represent all the messages inside the socket:
    var _b = (0, react_2.useState)([]), messages = _b[0], setMessages = _b[1];
    // each time the user change channel (click to a new one), we want to reset
    // all messages from the socket are they are now store in the database.
    (0, react_1.useEffect)(function () {
        setMessages([]);
    }, ([channelId]));
    var addMessage = function (newMessage, messageType) {
        newMessage.messageType = messageType;
        setMessages(__spreadArray(__spreadArray([], messages, true), [newMessage], false));
    };
    return (react_1.default.createElement("div", { className: "ContentMessage" },
        react_1.default.createElement(HeaderChatBox_1.default, null),
        react_1.default.createElement(ChatView_1.default, { userId: userId, conversation: conversation, messages: messages, channelId: channelId }),
        react_1.default.createElement(ChatPrompt_1.default, { socket: socket, simulatedUserId: simulatedUserId, channelId: channelId, addMessage: addMessage })));
}
exports.default = ContentMessage;
//# sourceMappingURL=ContentMessage.js.map