"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var TimeElapsed = function (_a) {
    var date = _a.date;
    var getTimeElapsed = function (date) {
        var currentDate = new Date();
        var timeDiff = currentDate.getTime() - date.getTime();
        var secondsElapsed = Math.floor(timeDiff / 1000);
        if (secondsElapsed < 60) {
            return "few seconds ago";
        }
        else if (secondsElapsed < 3600) {
            var minutesElapsed = Math.floor(secondsElapsed / 60);
            return "".concat(minutesElapsed, " minute(s)");
        }
        else {
            var hoursElapsed = Math.floor(secondsElapsed / 3600);
            if (hoursElapsed < 24) {
                return "".concat(hoursElapsed, " heure(s)");
            }
            else {
                var daysElapsed = Math.floor(hoursElapsed / 24);
                return "".concat(daysElapsed, " jour(s)");
            }
        }
    };
    var elapsedTime = getTimeElapsed(date);
    return react_1.default.createElement("span", null, elapsedTime);
};
exports.default = TimeElapsed;
//# sourceMappingURL=TimeElapsed.js.map