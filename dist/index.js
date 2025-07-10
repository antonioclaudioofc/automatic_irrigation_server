"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const cors_1 = require("@fastify/cors");
const routes_1 = require("./routes");
const websocket_1 = __importDefault(require("@fastify/websocket"));
const app = (0, fastify_1.fastify)();
app.register(cors_1.fastifyCors, { origin: "*" });
app.register(websocket_1.default);
app.register(routes_1.routes);
app.listen({ port: parseInt(process.env.PORT || "3333") }).then(() => {
    console.log("HTTP server running!");
});
