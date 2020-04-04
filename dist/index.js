"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./lastfm/index");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const moment_1 = __importDefault(require("moment"));
const app = express_1.default();
const port = 3535;
dotenv_1.default.config();
app.get("/", (req, res) => {
    res.send("Hello world");
});
app.listen(port, err => {
    if (err) {
        return console.log(err);
    }
    return console.log(`server is listening on port ${port}`);
});
const today = moment_1.default();
const lastWeek = moment_1.default().subtract(1, "weeks");
index_1.fetchTopTracks("test", lastWeek, today);
//# sourceMappingURL=index.js.map