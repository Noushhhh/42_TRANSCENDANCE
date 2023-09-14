"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
require("../styles/HeaderChatBox.css");
var RadioButtonUnchecked_1 = __importDefault(require("@mui/icons-material/RadioButtonUnchecked"));
var DeleteOutline_1 = __importDefault(require("@mui/icons-material/DeleteOutline"));
var ArrowBackIos_1 = __importDefault(require("@mui/icons-material/ArrowBackIos"));
function HeaderChatBox() {
    return (react_1.default.createElement("div", { className: "HeaderChatBox" },
        react_1.default.createElement("div", { className: "ContactName" },
            react_1.default.createElement("span", { className: "ArrowBackPhone" },
                react_1.default.createElement(ArrowBackIos_1.default, null)),
            react_1.default.createElement(RadioButtonUnchecked_1.default, null),
            react_1.default.createElement("p", null, "John Doe")),
        react_1.default.createElement("div", { className: "HeaderChatBoxLogo" },
            react_1.default.createElement(DeleteOutline_1.default, null))));
}
exports.default = HeaderChatBox;
//# sourceMappingURL=HeaderChatBox.js.map