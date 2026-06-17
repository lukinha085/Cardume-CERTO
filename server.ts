/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
// Load base configuration from .env
dotenv.config();
// Override with .env.local if it exists (.env.local takes precedence)
dotenv.config({ path: '.env.local', override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Analyze conversation in a single task
  app.post("/api/analyze-task", async (req, res) => {
    const { taskTitle, taskDescription, messages } = req.body;

    const formattedMessages = (messages || [])
      .map((m: any) => `${m.senderName}: "${m.content}"`)
      .join("\n");

    const apiKey = process.env.GEMINI_API_KEY;
    const isApiKeyConfigured = apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "";

    if (!isApiKeyConfigured) {
      console.log("GEMINI_API_KEY is not defined or is placeholder. Using simulated analysis.");
      return res.json({
        isSimulated: true,
        analysis: generateSimulatedTaskAnalysis(taskTitle, messages || []),
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
Tarefa: "${taskTitle}"
Contexto/Missão da Tarefa: "${taskDescription || 'Não especificado'}"

Conversores / Discussão da Equipe:
${formattedMessages || 'Sem mensagens ainda.'}

Sua missão é atuar como o assistente empático "Cardume". Cardume analisa dinâmicas de colaboração sob uma perspectiva de cuidado mútuo, ética e bem-estar coletivo, ao invés de vigilância ou monitoramento de rendimento.
Baseado na conversa acima, preencha os campos de análise de forma extremamente cuidadosa, construtiva, empática e acolhedora. Evite termos secos ou corporativos e foque no bem-estar humano, empatia recíproca, clareza e transparência.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é o assistente empático Cardume. Sua missão é apoiar a sincronia do time por meio de reflexões profundas sobre as dinâmicas humanas, identificando como guiar o time com cuidado, sem focar em velocidade de entrega fria, e sim em bem-estar e conexões saudáveis.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              positiveSignals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Pelo menos 2 aspectos positivos sobre a forma como o time está se apoiando ou se expressando nesta ferramenta."
              },
              communicationPatterns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Aspectos estilísticos ou de ritmo observados na comunicação (ex: feedback rápido, tom calmo, etc)."
              },
              overloadSigns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Indícios de cansaço, mensagens muito tarde, tons apressados ou excesso de pendências."
              },
              potentialTensions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Pontos de fricção, dúvidas operacionais ou diferenças de perspectiva não resolvidas."
              },
              collaborationRisks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Fatores que podem desajustar a sincronia do time no futuro se não observados com carinho."
              },
              improvementSuggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Sugestões de ações coletivas acolhedoras (ex: ajustar documentação do Figma, fazer uma pausa curta, esclarecer com carinho)."
              },
              overallSummary: {
                type: Type.STRING,
                description: "Um texto reflexivo central (máximo 4 linhas) agindo como um espelho de cuidado."
              }
            },
            required: [
              "positiveSignals",
              "communicationPatterns",
              "overloadSigns",
              "potentialTensions",
              "collaborationRisks",
              "improvementSuggestions",
              "overallSummary"
            ]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsedAnalysis = JSON.parse(responseText.trim());

      return res.json({
        isSimulated: false,
        analysis: parsedAnalysis,
      });

    } catch (error: any) {
      console.error("Gemini API call failed:", error);
      return res.json({
        isSimulated: true,
        error: error.message,
        analysis: generateSimulatedTaskAnalysis(taskTitle, messages || []),
      });
    }
  });

  // API Route: Analyze multiple tasks and conversations to provide general system health suggestions
  app.post("/api/analyze-team-health", async (req, res) => {
    const { tasks, messages } = req.body;

    const formattedTasks = (tasks || [])
      .map((t: any) => `- Tarefa [Coluna: ${t.column}]: "${t.title}" (Prioridade: ${t.priority})`)
      .join("\n");

    const formattedAllMessages = (messages || [])
      .map((m: any) => `${m.senderName} na tarefa "${m.taskTitle || 'Geral'}": "${m.content}"`)
      .join("\n");

    const apiKey = process.env.GEMINI_API_KEY;
    const isApiKeyConfigured = apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "";

    if (!isApiKeyConfigured) {
      console.log("GEMINI_API_KEY is placeholder or undefined. Using simulated team health insights.");
      return res.json({
        isSimulated: true,
        health: generateSimulatedTeamHealth(tasks || []),
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
Lista de Tarefas Atuais:
${formattedTasks || 'Nenhuma tarefa cadastrada.'}

Mensagens recentes das discussões do time:
${formattedAllMessages || 'Nenhum histórico de mensagens no círculo de discussões.'}

Analise a sincronia e o clima coletivo da equipe. Lembre-se, o objetivo do Cardume é o cuidado e a união sustentável, eliminando a vigilância.
Por favor, responda com um JSON estruturado para mapear o status de integridade do time.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é o assistente empático Cardume. Forneça uma resposta JSON acolhedora que descreva o clima geral, o tempo de descanso/carga recomendado para regeneração e uma sugestão profunda sobre bem-estar coletivo (Sinais de Cuidado).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              climate: {
                type: Type.STRING,
                description: "Clima do time expresso em uma palavra acolhedora (ex: 'Sereno', 'Vibrante', 'Profundo', 'Maré de Descanso')."
              },
              rechargeTime: {
                type: Type.STRING,
                description: "Recomendação lúdica ou real de recarga coletiva (ex: '12h Restantes', 'Pausa Fluida', 'Espaço Livre à Tarde')."
              },
              mentalAlignment: {
                type: Type.STRING,
                description: "Grau de fluidez de foco (ex: 'Alta Fluidez', 'Sincronia Média', 'Foco Individualizado')."
              },
              empathyLevel: {
                type: Type.INTEGER,
                description: "Um número de 0 a 100 indicando a proximidade nas conversas coletivas com base em palavras gentis ou de escuta."
              },
              collectiveSymmetry: {
                type: Type.INTEGER,
                description: "Porcentagem (0-100) representando as tarefas que caminham em alinhamento ético e em equipe."
              },
              careSignals: {
                type: Type.STRING,
                description: "Uma mensagem central de acolhimento (máximo de 3 linhas) que aponta um cuidado a ser tomado ou uma pausa sugerida."
              }
            },
            required: [
              "climate",
              "rechargeTime",
              "mentalAlignment",
              "empathyLevel",
              "collectiveSymmetry",
              "careSignals"
            ]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsedHealth = JSON.parse(responseText.trim());

      return res.json({
        isSimulated: false,
        health: parsedHealth,
      });

    } catch (error: any) {
      console.error("Gemini Team Health API call failed:", error);
      return res.json({
        isSimulated: true,
        error: error.message,
        health: generateSimulatedTeamHealth(tasks || []),
      });
    }
  });


  // Serve static assets in production or mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite dev middleware mounted on Express.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from /dist.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cardume is swimming on port http://localhost:${PORT}`);
  });
}

// Simulated dynamic fallbacks to maintain beautiful UI offline/key-less:
function generateSimulatedTaskAnalysis(taskTitle: string, messages: any[]) {
  const containsLateIndicator = messages.some((m: any) => m.content.toLowerCase().includes("tarde") || m.content.toLowerCase().includes("noite"));
  const containsAppreciation = messages.some((m: any) => m.content.toLowerCase().includes("gostei") || m.content.toLowerCase().includes("obrigado") || m.content.toLowerCase().includes("ótimo") || m.content.toLowerCase().includes("parabéns"));

  return {
    positiveSignals: containsAppreciation 
      ? [
          "Presença constante de validação calorosa mútua nas mensagens.",
          "Forte incentivo estético e validação recíproca de designs enviados."
        ]
      : [
          "O time se comunica de forma construtiva sobre os pontos de ajuste do design.",
          "Abertura para compartilhar o status de forma transparente."
        ],
    communicationPatterns: [
      "Diálogos fluidos e focados no feedback mútuo.",
      "Troca sincera de insights com linguagem natural e respeitosa."
    ],
    overloadSigns: containsLateIndicator
      ? [
          "Sinais leves de cansaço ou mensagens sendo enviadas acumulando turnos.",
          "O fluxo de alteração de layout à noite pode indicar esgotamento de energia de foco."
        ]
      : [
          "Baixa sobrecarga observada, mas atenção ao acumular micro-tarefas de validação."
        ],
    potentialTensions: [
      "Divergência sutil sobre contrastes ou sombras que precisa de encerramento amigável.",
      "Aguardando feedback final de Leo para sintonizar a versão com o guia de estilo."
    ],
    collaborationRisks: [
      "Processo de revisão manual de sombras no Figma pode sobrecarregar Marcus ou Sarah se não for compartilhado."
    ],
    improvementSuggestions: [
      "Se sugerido, façam uma pausa coletiva de 15 minutos para refrescar o olhar antes de rodar o veredito final.",
      "Reunir em chamada curta de 5 minutos sobre 'fluidos líquidos' para dissipar dúvidas das sombras e alinhar o ciclo."
    ],
    overallSummary: `Os integrantes demonstram grande empatia mútua ao refinar a tarefa "${taskTitle}". É perceptível o cuidado de Marcus em validar as observações de Sarah. Cuidado apenas com a sobreposição de ajustes noturnos para evitar desgastes de foco.`
  };
}

function generateSimulatedTeamHealth(tasks: any[]) {
  const doneTasksCount = tasks.filter((t: any) => t.column === 'done').length;
  const inProgressTasksCount = tasks.filter((t: any) => t.column === 'inprogress').length;
  const totalTasks = tasks.length || 1;
  const symmetry = Math.min(100, Math.round(((doneTasksCount + inProgressTasksCount * 0.5) / totalTasks) * 100));

  return {
    climate: "Sereno",
    rechargeTime: "12h Restantes",
    mentalAlignment: "Alta Fluidez",
    empathyLevel: 75 + Math.round(Math.random() * 15),
    collectiveSymmetry: symmetry || 85,
    careSignals: 'O time está operando em maré alta hoje. Considere planejar uma pausa coletiva curta amanhã. A energia sustentada gera melhores reflexos criativos a longo prazo no ecossistema Cardume.'
  };
}

startServer();
