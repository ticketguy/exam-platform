import crypto from "crypto";

interface RpcResponse {
  result: unknown;
  error: { code: number; message: string } | null;
  id: string;
}

export class DigiByteRPC {
  private url: string;
  private auth: string;
  private isMock: boolean;

  constructor() {
    const host = process.env.DGB_RPC_HOST || "localhost";
    const port = process.env.DGB_RPC_PORT || "14022";
    const user = process.env.DGB_RPC_USER || "digibyte";
    const pass = process.env.DGB_RPC_PASS || "";
    this.url = `http://${host}:${port}`;
    this.auth = Buffer.from(`${user}:${pass}`).toString("base64");
    this.isMock = process.env.DGB_MODE !== "live";
  }

  private async rpcCall(method: string, params: unknown[] = []): Promise<unknown> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.auth}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "nocho",
        method,
        params,
      }),
    });

    if (!res.ok) {
      throw new Error(`RPC request failed with status ${res.status}`);
    }

    const data: RpcResponse = await res.json();
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message} (code: ${data.error.code})`);
    }
    return data.result;
  }

  async getNewAddress(label = "nocho"): Promise<string> {
    if (this.isMock) {
      return `DGBmock_${crypto.randomBytes(16).toString("hex")}`;
    }
    return this.rpcCall("getnewaddress", [label]) as Promise<string>;
  }

  async getBalance(): Promise<number> {
    if (this.isMock) return 0;
    return this.rpcCall("getbalance") as Promise<number>;
  }

  async sendToAddress(address: string, amount: number): Promise<string> {
    if (this.isMock) {
      return `mocktxid_${crypto.randomBytes(16).toString("hex")}`;
    }
    return this.rpcCall("sendtoaddress", [address, amount]) as Promise<string>;
  }

  async getTransaction(txid: string): Promise<Record<string, unknown>> {
    if (this.isMock) {
      return {
        txid,
        confirmations: 10,
        amount: 0,
        time: Date.now() / 1000,
      };
    }
    return this.rpcCall("gettransaction", [txid]) as Promise<Record<string, unknown>>;
  }

  async listTransactions(label = "*", count = 100): Promise<Record<string, unknown>[]> {
    if (this.isMock) return [];
    return this.rpcCall("listtransactions", [label, count]) as Promise<
      Record<string, unknown>[]
    >;
  }

  async validateAddress(
    address: string
  ): Promise<{ isvalid: boolean; [key: string]: unknown }> {
    if (this.isMock) {
      return { isvalid: address.startsWith("D") && address.length >= 20 };
    }
    return this.rpcCall("validateaddress", [address]) as Promise<{
      isvalid: boolean;
      [key: string]: unknown;
    }>;
  }

  async getBlockchainInfo(): Promise<Record<string, unknown>> {
    if (this.isMock) {
      return {
        chain: "digibyte",
        blocks: 0,
        headers: 0,
        difficulty: 0,
        mock: true,
      };
    }
    return this.rpcCall("getblockchaininfo") as Promise<Record<string, unknown>>;
  }

  async testConnection(): Promise<{ success: boolean; info?: Record<string, unknown>; error?: string }> {
    try {
      if (this.isMock) {
        return { success: true, info: { mock: true, status: "Mock mode active" } };
      }
      const info = await this.getBlockchainInfo();
      return { success: true, info: info as Record<string, unknown> };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }
}

export const dgbRpc = new DigiByteRPC();
