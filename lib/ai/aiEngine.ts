import { getFullAIContext, type FinancialAIContext } from "./aiContextProviders";

export interface AIInsightItem {
  id: string;
  type: "spending" | "budget" | "savings" | "trend" | "recommendation";
  title: string;
  message: string;
  severity: "info" | "warning" | "success";
  scoreImpact?: number;
  actionableLink?: string;
}

export interface AIPlugin {
  id: string;
  name: string;
  version: string;
  capabilities: ("insights" | "forecast" | "categorization" | "chat")[];
  analyze(context: FinancialAIContext): Promise<AIInsightItem[]>;
}

export class AIEngineRegistry {
  private static instance: AIEngineRegistry;
  private plugins: Map<string, AIPlugin> = new Map();

  private constructor() {}

  public static getInstance(): AIEngineRegistry {
    if (!AIEngineRegistry.instance) {
      AIEngineRegistry.instance = new AIEngineRegistry();
    }
    return AIEngineRegistry.instance;
  }

  public registerPlugin(plugin: AIPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  public unregisterPlugin(pluginId: string): void {
    this.plugins.delete(pluginId);
  }

  public getRegisteredPlugins(): { id: string; name: string; capabilities: string[] }[] {
    return Array.from(this.plugins.values()).map((p) => ({
      id: p.id,
      name: p.name,
      capabilities: p.capabilities,
    }));
  }

  public async runAnalysis(customContext?: FinancialAIContext): Promise<AIInsightItem[]> {
    const context = customContext || getFullAIContext();
    const results: AIInsightItem[] = [];

    for (const plugin of this.plugins.values()) {
      try {
        const pluginInsights = await plugin.analyze(context);
        results.push(...pluginInsights);
      } catch (err) {
        console.error(`AI Plugin [${plugin.id}] execution failed:`, err);
      }
    }

    return results;
  }
}
