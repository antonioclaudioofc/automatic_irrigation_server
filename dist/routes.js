"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = routes;
const firebase_1 = require("./firebase");
function routes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.post("/irrigation", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const body = request.body;
            const now = Date.now();
            const irrigationData = {
                plantName: body.plantName,
                specificDate: body.specificDate,
                time: body.time,
                status: body.status || "Ativo",
                createdAt: now,
                updatedAt: now,
            };
            const ref = firebase_1.realtime.ref("irrigation").push();
            yield ref.set(irrigationData);
            return reply.status(201).send({ ok: true, id: ref.key });
        }));
        app.get("/irrigation", (_, reply) => __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield firebase_1.realtime.ref("irrigation").once("value");
            const data = snapshot.val() || {};
            return reply.send(data);
        }));
        app.get("/ws", { websocket: true }, (connection, req) => {
            const ref = firebase_1.realtime.ref("irrigation");
            const listener = ref.on("value", (snapshot) => {
                try {
                    if (connection.readyState === 1) {
                        connection.send(JSON.stringify(snapshot.val() || {}));
                    }
                }
                catch (e) {
                    console.error("Erro ao enviar via socket:", e);
                }
            });
            connection.on("close", () => {
                console.log("WebSocket desconectado");
                ref.off("value", listener);
            });
        });
    });
}
