import { FastifyInstance, FastifyRequest } from "fastify";
import { realtime } from "./firebase";
import { WebSocket } from "@fastify/websocket";
import { WebSocketServer } from "ws";

type IrrigationBody = {
  plantName: string;
  specificDate: string;
  time: string;
  duration: number;
  status?: "Ativo" | "Concluído" | "Em execução";
};

export async function routes(app: FastifyInstance) {
  app.post("/irrigation", async (request, reply) => {
    const body = request.body as IrrigationBody;

    const now = Date.now();

    const irrigationData = {
      plantName: body.plantName,
      specificDate: body.specificDate,
      time: body.time,
      status: body.status || "Ativo",
      createdAt: now,
      updatedAt: now,
    };

    const ref = realtime.ref("irrigation").push();
    await ref.set(irrigationData);

    return reply.status(201).send({ ok: true, id: ref.key });
  });

  app.get("/irrigation", async (_, reply) => {
    const snapshot = await realtime.ref("irrigation").once("value");
    const data = snapshot.val() || {};
    return reply.send(data);
  });

  app.get(
    "/ws",
    { websocket: true },
    (connection: WebSocket, req: FastifyRequest) => {
      const ref = realtime.ref("irrigation");

      const listener = ref.on("value", (snapshot) => {
        try {
          if (connection.readyState === 1) {
            connection.send(JSON.stringify(snapshot.val() || {}));
          }
        } catch (e) {
          console.error("Erro ao enviar via socket:", e);
        }
      });

      connection.on("close", () => {
        console.log("WebSocket desconectado");
        ref.off("value", listener);
      });
    }
  );
}
