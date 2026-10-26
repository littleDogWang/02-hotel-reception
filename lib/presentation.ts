import type { ScenarioPresentation } from '@/types/presentation';
export type { ScenarioPresentation } from '@/types/presentation';

export const presentation: ScenarioPresentation = {
  "id": "05-hotel-reception",
  "name": "Hotel Reception Assistant",
  "purpose": "Hotel information and room availability",
  "headline": [
    "Your stay, made clearer."
  ],
  "summary": "Ask about hotel services, room availability and reservation options.",
  "featuresHeading": "Beyond starter",
  "features": [
    {
      "emoji": "🛎️",
      "title": "Hotel services"
    },
    {
      "emoji": "🛏️",
      "title": "Room availability"
    },
    {
      "emoji": "📋",
      "title": "Reservation guidance"
    }
  ],
  "builtWith": [
    "Agora Conversational AI",
    "Agents SDK",
    "Next.js"
  ],
  "startLabel": "Talk to hotel reception",
  "boundaryShort": "Information and availability only. No confirmed reservation or payment.",
  "outcomes": [
    {
      "id": "answered",
      "label": "My questions were answered"
    },
    {
      "id": "needs-help",
      "label": "I need more help"
    }
  ],
  "developer": {
    "sourceUrl": "https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs",
    "runCommand": "pnpm install\nagora login\nagora project use <your-project>\nagora project env write .env.local\npnpm dev",
    "skillsCommand": "npx skills add github:AgoraIO/skills",
    "assistantPrompt": "Use Agora Skills to work in the existing 05-hotel-reception scenario checkout. Preserve the working Agora session lifecycle and business contracts. Help me adapt its business data and assistant instructions for my workflow.",
    "docsUrl": "https://docs.agora.io/en/ai/build/build-server-client",
    "sdkUrl": "https://www.npmjs.com/package/agora-agents",
    "consoleUrl": "https://console.agora.io/",
    "cliUrl": "https://github.com/AgoraIO/cli",
    "skillsUrl": "https://github.com/AgoraIO/skills",
    "extensionPoints": [
      {
        "title": "Change assistant instructions",
        "path": "lib/agent-config.ts"
      },
      {
        "title": "Adapt hotel.json",
        "path": "lib/hotel-reception/hotel.json"
      },
      {
        "title": "Choose models and voice",
        "path": "app/api/invite-agent/route.ts"
      },
      {
        "title": "Adapt scenario UI content",
        "path": "lib/presentation.ts"
      }
    ]
  }
};

export function getScenarioPresentation(): ScenarioPresentation {
  return presentation;
}
