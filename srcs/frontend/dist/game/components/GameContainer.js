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
var GamePhysics_1 = __importDefault(require("./GamePhysics"));
var ScoreBoard_1 = __importDefault(require("./ScoreBoard"));
require("../styles/GameContainer.css");
function GameContainer() {
    var _a = (0, react_1.useState)(0), p1Score = _a[0], setP1Score = _a[1];
    var _b = (0, react_1.useState)(0), p2Score = _b[0], setP2Score = _b[1];
    var _c = (0, react_1.useState)(true), isPaused = _c[0], setIsPaused = _c[1];
    return (react_1.default.createElement("div", { className: "GameContainer" },
        react_1.default.createElement(ScoreBoard_1.default, { p1Score: p1Score, p2Score: p2Score }),
        react_1.default.createElement(GamePhysics_1.default, { setP1Score: setP1Score, setP2Score: setP2Score, isPaused: isPaused }),
        react_1.default.createElement("button", { style: { position: "absolute", top: "5%", right: "15%" }, onClick: function () { return setIsPaused(!isPaused); } }, isPaused ? "Play" : "Pause")));
}
exports.default = GameContainer;
//# sourceMappingURL=GameContainer.js.map