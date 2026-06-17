/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      model: "gemini-2.5-flash",
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
}

// Simulated dynamic fallback to maintain beautiful UI offline/key-less:
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
