"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../styles/ScoreBoard.css");
var react_1 = __importDefault(require("react"));
function ScoreBoard(_a) {
    var _b = _a.p1Score, p1Score = _b === void 0 ? 0 : _b, _c = _a.p2Score, p2Score = _c === void 0 ? 0 : _c;
    return (react_1.default.createElement("div", { className: "ScoreBoard" },
        react_1.default.createElement("div", null, p1Score),
        react_1.default.createElement("div", null, p2Score)));
}
exports.default = ScoreBoard;
//# sourceMappingURL=ScoreBoard.js.map