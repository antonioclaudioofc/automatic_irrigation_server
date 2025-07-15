import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { realtime } from "./firebase";
import { WebSocket } from "@fastify/websocket";

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

  app.delete("/irrigation/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    if (!id) {
      return reply.status(400).send({ error: "ID da irrigação é obrigatório" });
    }

    try {
      const ref = realtime.ref(`irrigation/${id}`);
      await ref.remove();
      return reply.status(200).send({ ok: true });
    } catch (err) {
      console.error("Erro ao excluir irrigação:", err);
      return reply
        .status(500)
        .send({ error: "Erro interno ao excluir irrigação" });
    }
  });

  app.put(
    "/irrigation/:id",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: IrrigationBody;
      }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const updates = request.body;

      try {
        const ref = realtime.ref(`irrigation/${id}`);

        const snapshot = await ref.once("value");
        if (!snapshot.exists()) {
          return reply.status(404).send({ error: "Irrigação não encontrada" });
        }

        await ref.update(updates);

        return reply.send({ ok: true, id });
      } catch (error) {
        console.error("Erro ao atualizar irrigação:", error);
        return reply
          .status(500)
          .send({ error: "Erro interno ao atualizar irrigação" });
      }
    }
  );
}
