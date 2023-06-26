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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
require("../styles/ChatPrompt.css");
var Send_1 = __importDefault(require("@mui/icons-material/Send"));
require("../types/type.Message");
function ChatPrompt(_a) {
    var addMessage = _a.addMessage, channelId = _a.channelId, simulatedUserId = _a.simulatedUserId, socket = _a.socket;
    var _b = (0, react_1.useState)(""), message = _b[0], setMessage = _b[1];
    var handleMessageChange = function (event) {
        setMessage(event.target.value);
    };
    function isWhitespace(str) {
        return /^\s*$/.test(str);
    }
    var storeMsgToDatabase = function (message) {
        var id = message.id, newMessage = __rest(message, ["id"]);
        fetch("http://localhost:4000/api/chat/addMessageToChannel/11", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        })
            .then(function (response) { return response.json(); })
            .then(function (createdMessage) {
            // Traitez la réponse de la requête ici
            console.log(createdMessage);
        })
            .catch(function (error) {
            // Gérez les erreurs
            console.error(error);
        });
    };
    var sendMessage = function () {
        var msgToSend = {
            channelId: channelId,
            content: message,
            id: 0,
            senderId: simulatedUserId,
            createdAt: new Date(),
            messageType: "MessageTo",
        };
        if (!isWhitespace(message)) {
            addMessage(msgToSend, "MessageTo");
        }
        var id = msgToSend.id, createdAt = msgToSend.createdAt, messageType = msgToSend.messageType, parsedMessage = __rest(msgToSend, ["id", "createdAt", "messageType"]);
        socket.emit('message', msgToSend);
        storeMsgToDatabase(parsedMessage);
        setMessage("");
    };
    socket.on('message', function (id, data) {
        if (!data)
            return;
        if (socket.id == id || isWhitespace(data.content))
            return;
        addMessage(data, "MessageFrom");
        setMessage("");
    });
    return (react_1.default.createElement("div", { className: "ChatPrompt" },
        react_1.default.createElement("input", { value: message, className: "InputChatPrompt", onChange: handleMessageChange, type: "text" }),
        react_1.default.createElement("button", { className: "SendIconPromptChat", onClick: sendMessage },
            react_1.default.createElement(Send_1.default, null))));
}
exports.default = ChatPrompt;
//# sourceMappingURL=ChatPrompt.js.map