// Adapted from https://gitlab.com/aedge/codemirror-web-workers-lsp-demo

import { Transport } from "@open-rpc/client-js/build/transports/Transport";
import { getNotifications } from "@open-rpc/client-js/build/Request";
import type { JSONRPCRequestData, IJSONRPCData } from "@open-rpc/client-js/build/Request";

export default class PostMessageWorkerTransport extends Transport {
	public worker: undefined | null | Worker;

	constructor(worker: Worker) {
		super();
		this.worker = worker;
	}

	private messageHandler = (ev: MessageEvent) => {
		console.log("LS to editor <<-", JSON.parse(ev.data));
		this.transportRequestManager.resolveResponse(ev.data);
	};

	public connect(): Promise<void> {
		return new Promise(async (resolve) => {
			this.worker.addEventListener("message", this.messageHandler);
			resolve();
		});
	}

	public async sendData(data: JSONRPCRequestData, timeout: number | null = 5000): Promise<any> {
		console.log("Editor to LS ->>", data);
		const prom = this.transportRequestManager.addRequest(data, null);
		const notifications = getNotifications(data);
		if (this.worker) {
			this.worker.postMessage((data as IJSONRPCData).request);
			this.transportRequestManager.settlePendingRequest(notifications);
		}
		return prom;
	}

	public close(): void {
		this.worker.terminate();
	}
}

