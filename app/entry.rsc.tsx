export { default } from "@react-router/dev/config/default-rsc-entries/entry.rsc";
import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject<Env> {
	async sayHello() {
		return "Hello from Durable Object";
	}
}
