import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { routes } from "./routes";
import fastifyWebsocket from "@fastify/websocket";

const app = fastify();

app.register(fastifyCors, { origin: "*" });

app.register(fastifyWebsocket);

app.register(routes);

app
  .listen({ port: 3333, host: "0.0.0.0" })
  .then(() => {
    console.log("Servidor HTTP rodando em http://localhost:3333");
  })
  .catch((err) => {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  });
