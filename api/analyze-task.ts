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
}

// Simulated dynamic fallback to maintain beautiful UI offline/key-less:
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
