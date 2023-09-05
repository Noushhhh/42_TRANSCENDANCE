"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var react_konva_1 = require("react-konva");
var react_1 = __importStar(require("react"));
var KONVA_WIDTH = 1200;
var KONVA_HEIGHT = 800;
var PADDLE_HEIGHT = 150;
var PADDLE_WIDTH = 25;
var p1Props = {
    x: 10,
    y: 310,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    fill: "red",
    draggable: false,
};
var p2Props = {
    x: KONVA_WIDTH - 10 - PADDLE_WIDTH,
    y: 310,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    fill: "red",
    draggable: false,
};
var ballDirection = "left";
var ballDX = 0;
var ballDY = 0;
var GamePhysics = function (_a) {
    var setP1Score = _a.setP1Score, setP2Score = _a.setP2Score, _b = _a.isPaused, isPaused = _b === void 0 ? true : _b;
    var rect1Ref = (0, react_1.useRef)(null);
    var rect2Ref = (0, react_1.useRef)(null);
    var circleRef = (0, react_1.useRef)(null);
    var keyState = (0, react_1.useRef)({});
    var p1Pos = (0, react_1.useRef)({ x: 10, y: 310 });
    var p2Pos = (0, react_1.useRef)({
        x: KONVA_WIDTH - 10 - PADDLE_WIDTH,
        y: 310,
    });
    (0, react_1.useEffect)(function () {
        var handleKeyDown = function (event) {
            keyState.current[event.key] = true;
        };
        var handleKeyUp = function (event) {
            keyState.current[event.key] = false;
        };
        var animRequest;
        var updateRect = function () {
            if (isPaused)
                return;
            var rect1 = rect1Ref.current;
            if (!rect1)
                return;
            var rect2 = rect2Ref.current;
            if (!rect2)
                return;
            var position1 = rect1.position();
            var position2 = rect2.position();
            var moveAmount = 6;
            if (keyState.current["w"]) {
                if (position1.y > 0) {
                    rect1.position({ x: position1.x, y: position1.y - moveAmount });
                    p1Pos.current = rect1.position();
                }
            }
            if (keyState.current["s"]) {
                if (position1.y < KONVA_HEIGHT - PADDLE_HEIGHT) {
                    rect1.position({ x: position1.x, y: position1.y + moveAmount });
                    p1Pos.current = rect1.position();
                }
            }
            if (keyState.current["ArrowUp"]) {
                if (position2.y > 0) {
                    rect2.position({ x: position2.x, y: position2.y - moveAmount });
                    p2Pos.current = rect2.position();
                }
            }
            if (keyState.current["ArrowDown"]) {
                if (position2.y < KONVA_HEIGHT - PADDLE_HEIGHT) {
                    rect2.position({ x: position2.x, y: position2.y + moveAmount });
                    p2Pos.current = rect2.position();
                }
            }
            animRequest = requestAnimationFrame(updateRect);
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        var animRequest2 = requestAnimationFrame(updateRect);
        return function () {
            cancelAnimationFrame(animRequest);
            cancelAnimationFrame(animRequest2);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [isPaused]);
    var moveBall = function () {
        var _a, _b, _c, _d;
        var ball = circleRef.current;
        if (!ball)
            return;
        var ballPos = ball.position();
        if (ballDirection === "left") {
            if (!p1Pos.current)
                return;
            if (ballPos.x < 10 + PADDLE_WIDTH + 15 &&
                ballPos.x > 5 + PADDLE_WIDTH + 15 &&
                ballPos.y > ((_a = p1Pos.current) === null || _a === void 0 ? void 0 : _a.y) &&
                ballPos.y < ((_b = p1Pos.current) === null || _b === void 0 ? void 0 : _b.y) + PADDLE_HEIGHT) {
                var t = p1Pos.current.y + PADDLE_HEIGHT / 2 - ballPos.y;
                var tt = t / (PADDLE_HEIGHT / 2);
                var ttt = tt * (Math.PI / 4);
                ballDX = Math.cos(ttt) * 2;
                ballDY = -Math.sin(ttt) * 2;
                ballDirection = "right";
                return;
            }
            else if (ballPos.y < 0) {
                ballDY = -ballDY;
            }
            else if (ballPos.y > KONVA_HEIGHT) {
                ballDY = -ballDY;
            }
            if (ballPos.x < 0) {
                setP2Score(function (curr) { return curr + 1; });
                ball.position({ x: KONVA_WIDTH / 2, y: KONVA_HEIGHT / 2 });
                ballDX = 0;
                ballDY = 0;
            }
            else {
                ball.position({ x: ballPos.x - 2 - ballDX, y: ballPos.y - ballDY });
            }
        }
        else if (ballDirection === "right") {
            if (!p2Pos.current)
                return;
            if (ballPos.x > KONVA_WIDTH - PADDLE_WIDTH - 20 &&
                ballPos.x < KONVA_WIDTH - PADDLE_WIDTH - 15 &&
                ballPos.y > ((_c = p2Pos.current) === null || _c === void 0 ? void 0 : _c.y) &&
                ballPos.y < ((_d = p2Pos.current) === null || _d === void 0 ? void 0 : _d.y) + PADDLE_HEIGHT) {
                var t = p2Pos.current.y + PADDLE_HEIGHT / 2 - ballPos.y;
                var tt = t / (PADDLE_HEIGHT / 2);
                var ttt = -(tt * (Math.PI / 4));
                ballDX = Math.cos(ttt) * 2;
                ballDY = -Math.sin(ttt) * 2;
                ballDirection = "left";
                return;
            }
            else if (ballPos.y < 0) {
                ballDY = -ballDY;
            }
            else if (ballPos.y > KONVA_HEIGHT) {
                ballDY = -ballDY;
            }
            if (ballPos.x > KONVA_WIDTH) {
                setP1Score(function (curr) { return curr + 1; });
                ball.position({ x: KONVA_WIDTH / 2, y: KONVA_HEIGHT / 2 });
                ballDX = 0;
                ballDY = 0;
            }
            else {
                ball.position({ x: ballPos.x + 2 + ballDX, y: ballPos.y + ballDY });
            }
        }
    };
    (0, react_1.useEffect)(function () {
        var interval = setInterval(function () {
            if (!isPaused) {
                moveBall();
            }
        }, 1);
        return function () {
            clearInterval(interval);
        };
    });
    return (react_1.default.createElement(react_konva_1.Stage, { style: { backgroundColor: "white" }, className: "GamePhysics", width: KONVA_WIDTH, height: KONVA_HEIGHT },
        react_1.default.createElement(react_konva_1.Layer, null,
            react_1.default.createElement(react_konva_1.Rect, __assign({ ref: rect1Ref }, p1Props)),
            react_1.default.createElement(react_konva_1.Circle, { ref: circleRef, x: KONVA_WIDTH / 2, y: KONVA_HEIGHT / 2, radius: 20, fill: "green" }),
            react_1.default.createElement(react_konva_1.Rect, __assign({ ref: rect2Ref }, p2Props)))));
};
exports.default = GamePhysics;
//# sourceMappingURL=GamePhysics.js.map