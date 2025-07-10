import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { routes } from "./routes";
import fastifyWebsocket from "@fastify/websocket";

const app = fastify();

app.register(fastifyCors, { origin: "*" });

app.register(fastifyWebsocket);

app.register(routes);

app.listen({ port: parseInt(process.env.PORT || "3333") }).then(() => {
  console.log("HTTP server running!");
});
