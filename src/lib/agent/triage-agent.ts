import { Output, ToolLoopAgent, stepCountIs } from "ai";

import { reasoningModel } from "@/lib/ai";
import {
  buildTriageInstructions,
  buildTriagePrompt,
} from "@/lib/agent/prompt";
import { triageResultSchema } from "@/lib/agent/schemas";
import { triageTools } from "@/lib/agent/tools";
import type { BriefSource } from "@/data/sample-briefs";

export function createTriageAgent(source?: BriefSource | "") {
  return new ToolLoopAgent({
    model: reasoningModel,
    instructions: buildTriageInstructions(source),
    tools: triageTools,
    output: Output.object({ schema: triageResultSchema }),
    stopWhen: stepCountIs(12),
  });
}

export async function runTriage(brief: string, source?: BriefSource | "") {
  const agent = createTriageAgent(source);
  return agent.generate({ prompt: buildTriagePrompt(brief) });
}

export async function streamTriage(brief: string, source?: BriefSource | "") {
  const agent = createTriageAgent(source);
  return agent.stream({ prompt: buildTriagePrompt(brief) });
}

export type TriageAgent = ReturnType<typeof createTriageAgent>;
