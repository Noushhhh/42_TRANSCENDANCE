"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_2 = require("react");
function SimulateUserId(_a) {
    var setSimulatedUserId = _a.setSimulatedUserId;
    var _b = (0, react_2.useState)(""), userIdValue = _b[0], setUserIdValue = _b[1];
    var handleClick = function () {
        setSimulatedUserId(Number(userIdValue));
        setUserIdValue("");
    };
    var handleChange = function (event) {
        setUserIdValue(event.target.value);
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("p", null, "userId setter(as the auth is not finished) make sure to entend a valid ID"),
        react_1.default.createElement("input", { type: "text", onChange: handleChange }),
        react_1.default.createElement("button", { style: { backgroundColor: "blue", color: "white" }, onClick: handleClick }, "SET")));
}
exports.default = SimulateUserId;
//# sourceMappingURL=SimulateUserId.js.map