"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = routes;
const firebase_1 = require("./firebase");
async function routes(app) {
    app.post("/irrigation", async (request, reply) => {
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
        await ref.set(irrigationData);
        return reply.status(201).send({ ok: true, id: ref.key });
    });
    app.get("/irrigation", async (_, reply) => {
        const snapshot = await firebase_1.realtime.ref("irrigation").once("value");
        const data = snapshot.val() || {};
        return reply.send(data);
    });
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
}
