import { injectable, inject } from "inversify";
import {
    elizaLogger,
    IAgentRuntime,
    Memory,
    Provider,
    State,
} from "@elizaos/core";
import { FlowConnector, getFlowConnectorInstance } from "@elizaos/plugin-flow";
import { CONSTANTS } from "../symbols";
import { InjectableProvider } from "../interfaces";

/**
 * Connector provider
 */
@injectable()
export class ConnectorProvider
    implements Provider, InjectableProvider<FlowConnector>
{
    private _connector: FlowConnector;

    /**
     * Initialize the Flow connector provider
     * @param flowJSON The Flow JSON object
     */
    constructor(
        @inject(CONSTANTS.FlowJSON)
        private readonly flowJSON: Record<string, unknown>
    ) {}

    /**
     * Get the Flow connector instance
     * @param runtime The runtime object from Eliza framework
     */
    async getInstance(runtime: IAgentRuntime): Promise<FlowConnector> {
        if (!this._connector) {
            this._connector = await getFlowConnectorInstance(
                runtime,
                this.flowJSON
            );
        }
        return this._connector;
    }

    /**
     * Get the connector status
     * @param runtime The runtime object from Eliza framework
     */
    async getConnectorStatus(runtime: IAgentRuntime): Promise<string> {
        const instance = await this.getInstance(runtime);
        let output = `Now user<${runtime.character.name}> connected to\n`;
        output += `Flow network: ${instance.network}\n`;
        output += `Flow Endpoint: ${instance.rpcEndpoint}\n`;
        return output;
    }

    /**
     * Eliza provider `get` method
     * @returns The message to be injected into the context
     */
    async get(
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<string | null> {
        try {
            return await this.getConnectorStatus(runtime);
        } catch (error) {
            elizaLogger.error(
                "Error in Flow connector provider:",
                error.message
            );
            return null;
        }
    }
}
