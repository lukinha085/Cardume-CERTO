/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Task, Message, TeamHealth } from "./types";

export const SAMPLE_MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Sarah",
    avatar: "https://lh3.googleusercontent.com/aida/AP1WRLuuIV3-oKpcRlNf1_nLDk6NpBot_rCKKjexD5fykAcSuIUpXQbXJyG8rCrlSNrbo-yUtOKYKyJHaZAdjazpymFQQMpNmvOBjeyqAUQ-qoxI_Xt6FTWPOHEGXK_HP4lTioGbR3XLN18GafINoAdPn73V_tPm53xzCDuJA796ToDGCNnQHuoR5yU_QpiOcQ9tj3WhkJgqMTDdX_0vHv96kIcr_4vFYTkbYJeSw-4Bu8vlJ6DR02boDez96vY",
    role: "Líder de Design",
    company: "Agência Sincronia"
  },
  {
    id: "m2",
    name: "Marcus",
    avatar: "https://lh3.googleusercontent.com/aida/AP1WRLvb2HYdX8Ix_-8bIpLgPcdTFKR9SYdVcKdHYO-OAskcMGOev4qSuv8sKnGnmQ9CZQwovKLdkb9OAHftQOpKw5onKb3cpVG5LFqUSwWU8sbtnCjtpIQwMDi-aQCSpY88Yz3iyxox7vBkhV0b7WnqchBEY_GnmJ6uhfIQyperOydKpiGT2ywYL_aNbvyvmHBYLQWrrB_5DOmVKtHfApJz9fswnjm5C1Jphq5GP8qnQKc_TtXiHUIzpv8GBNfw",
    role: "Engenheiro Sênior",
    company: "TechFlow Inc."
  },
  {
    id: "m3",
    name: "Leo",
    avatar: "https://lh3.googleusercontent.com/aida/AP1WRLuj-dszw5pBGDn8WTCHzBrZDKhDeftTC9xJjlyyEXlaLw6StrOgihjz4llMOuk8uHavHySMslhWWo5IS-4haxb18bu0IpDDsSzcDIuze4wUQtVzERyu09o3l6l5LFcwk-8VH0VTC5Hd3n2g8-YbGJW6k2G7XJGfaiPlZxnF1G6GxGHqmCdwc7chaU8-RnTTNT7N9PHfU4xGNn9SqGh3ImKFKD1ZT_z8j3rSCmwM4Jq8vE-ki5k3LgVbGBk",
    role: "Diretor Criativo",
    company: "Estúdio de Imersão"
  },
  {
    id: "m4",
    name: "Elena (Você)",
    avatar: "https://lh3.googleusercontent.com/aida/AP1WRLt_DD7Dbt-QhTX-WvRGJ6H4r0DcyL46kV6ngrMWcSf5vHet4atKem0UHGUsaWZzLsOlsimRR6t957NE_Yae3lQ28jzqt6GQ2mubKaxiz3_LNNTbS8C1jrXhrVFy05cEqARCTPmCEnny4N8QQJYhhsg0-bQzKwGNvSHZ_HaSKVdWLwQknUJD_3LOdHmMUwEf7sN7YbjXj7PMt8dqr9hs5Tg93Hm4RgC631OMavQRf2InSaL5WtKtj3sodYIf",
    role: "Especialista em Interface",
    company: "Cardume Workspace"
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Pesquisa de Bio-materiais em Corais Profundos",
    description: "Pesquisa e compilação de alternativas de revestimento eco-sustentáveis baseadas em depósitos fósseis de corais, garantindo equilíbrio dinâmico.",
    priority: "BAIXA",
    column: "todo",
    assignees: ["m4"],
    effort: "4 Ciclos",
    statusText: "Não iniciada",
    progress: 0,
    checklist: [
      { id: "c1", text: "Compilar lista de 5 bio-materiais promissores", completed: false },
      { id: "c2", text: "Esboçar manifesto de biocompatibilidade", completed: false }
    ],
    insight: null
  },
  {
    id: "t2",
    title: "Ajuste de Salinidade no Tanque Delta",
    description: "Modulação precisa da infusão iônica para otimizar os padrões biológicos sem forçar a sobrecarga térmica ou estresse das espécies cultivadas.",
    priority: "MÉDIA",
    column: "todo",
    assignees: ["m1", "m2"],
    effort: "3 Ciclos",
    statusText: "Ontem",
    progress: 30,
    checklist: [
      { id: "c3", text: "Verificar níveis de Ph após infusão inicial", completed: true },
      { id: "c4", text: "Disparar alertas preventivos nos terminais", completed: false }
    ],
    insight: null
  },
  {
    id: "t3",
    title: "Refinar Manifesto de Design",
    description: "Precisamos garantir que os novos princípios de 'Clareza Bioluminescente' estejam bem documentados. O objetivo é equilibrar a imersão profunda com a facilidade de uso, evitando a sobrecarga cognitiva em ambientes de alta pressão.",
    priority: "MÉDIA",
    column: "inprogress",
    assignees: ["m1", "m2", "m3"],
    effort: "6-8 Ciclos",
    statusText: "AO VIVO",
    progress: 75,
    checklist: [
      { id: "c5", text: "Definir paleta de Petrol e Turquesa", completed: true },
      { id: "c6", text: "Revisar contrastes de acessibilidade nas sombras", completed: false },
      { id: "c7", text: "Validar animações de 'fluidez líquida'", completed: false }
    ],
    insight: "O time está em alta sincronia sobre a estética bioluminescente. Ponto de atenção: O checklist indica 75% de conclusão, mas o feedback visual recente de Leo no Figma precisa de validação final nas sombras e animações para fechar o ciclo."
  },
  {
    id: "t4",
    title: "Monitoramento de Oxigênio Setor Norte",
    description: "Instalação e verificação física nos sensores de fluxo gasoso para evitar tensões estruturais nos dutos submarinos principais.",
    priority: "CRÍTICA",
    column: "inprogress",
    assignees: ["m3"],
    effort: "5 Ciclos",
    statusText: "AO VIVO",
    progress: 50,
    checklist: [
      { id: "c8", text: "Prendido sensor norte de pressurização", completed: true },
      { id: "c9", text: "Calibrar entrada do duto reserva", completed: false }
    ],
    insight: null
  },
  {
    id: "t5",
    title: "Sincronização de Dados com a Estação Superfície",
    description: "Integração do barramento de rádio térmico para sintonizar a telemetria sem afetar o silêncio produtivo focado dos técnicos de mergulho.",
    priority: "MÉDIA",
    column: "inprogress",
    assignees: ["m2"],
    effort: "2 Ciclos",
    statusText: "Em andamento",
    progress: 65,
    checklist: [
      { id: "c10", text: "Ativar ping de atenuação acústica", completed: true },
      { id: "c11", text: "Sincronizar logs da base", completed: false }
    ],
    insight: null
  },
  {
    id: "t6",
    title: "Calibração de Sensores de Pressão",
    description: "Equilíbrio de vedação mecânica garantido em 1atm. Ciclo completo de testes de estresse estático sem falhas de integridade.",
    priority: "CONCLUÍDO",
    column: "done",
    assignees: ["m1", "m4"],
    effort: "1 Ciclo",
    statusText: "2 horas atrás",
    progress: 100,
    checklist: [
      { id: "c12", text: "Trocar o-rings das conexões", completed: true },
      { id: "c13", text: "Homologar estanqueidade de segurança", completed: true }
    ],
    insight: "A calibração ocorreu de maneira leve e altamente colaborativa, com Sarah provendo respostas imediatas sobre os valores ideais. Nenhuma sobrecarga registrada."
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg1",
    taskId: "t3",
    senderId: "m1",
    senderName: "Sarah",
    senderAvatar: "https://lh3.googleusercontent.com/aida/AP1WRLuuIV3-oKpcRlNf1_nLDk6NpBot_rCKKjexD5fykAcSuIUpXQbXJyG8rCrlSNrbo-yUtOKYKyJHaZAdjazpymFQQMpNmvOBjeyqAUQ-qoxI_Xt6FTWPOHEGXK_HP4lTioGbR3XLN18GafINoAdPn73V_tPm53xzCDuJA796ToDGCNnQHuoR5yU_QpiOcQ9tj3WhkJgqMTDdX_0vHv96kIcr_4vFYTkbYJeSw-4Bu8vlJ6DR02boDez96vY",
    content: "Gostei muito de como os gradientes suavizam a transição entre telas. Transmite uma calma incrível. 🌊",
    timestamp: "10:24"
  },
  {
    id: "msg2",
    taskId: "t3",
    senderId: "m2",
    senderName: "Marcus",
    senderAvatar: "https://lh3.googleusercontent.com/aida/AP1WRLvb2HYdX8Ix_-8bIpLgPcdTFKR9SYdVcKdHYO-OAskcMGOev4qSuv8sKnGnmQ9CZQwovKLdkb9OAHftQOpKw5onKb3cpVG5LFqUSwWU8sbtnCjtpIQwMDi-aQCSpY88Yz3iyxox7vBkhV0b7WnqchBEY_GnmJ6uhfIQyperOydKpiGT2ywYL_aNbvyvmHBYLQWrrB_5DOmVKtHfApJz9fswnjm5C1Jphq5GP8qnQKc_TtXiHUIzpv8GBNfw",
    content: "Concordo, Sarah! Acho que podemos reforçar esse sentimento no input de mensagens também. O que acham?",
    timestamp: "10:45"
  },
  {
    id: "msg3",
    taskId: "t3",
    senderId: "system",
    senderName: "Cardume",
    senderAvatar: "system",
    content: "Leo adicionou uma nova versão do manifesto",
    timestamp: "10:55",
    isSystem: true
  },
  {
    id: "msg4",
    taskId: "t3",
    senderId: "m3",
    senderName: "Leo",
    senderAvatar: "https://lh3.googleusercontent.com/aida/AP1WRLuj-dszw5pBGDn8WTCHzBrZDKhDeftTC9xJjlyyEXlaLw6StrOgihjz4llMOuk8uHavHySMslhWWo5IS-4haxb18bu0IpDDsSzcDIuze4wUQtVzERyu09o3l6l5LFcwk-8VH0VTC5Hd3n2g8-YbGJW6k2G7XJGfaiPlZxnF1G6GxGHqmCdwc7chaU8-RnTTNT7N9PHfU4xGNn9SqGh3ImKFKD1ZT_z8j3rSCmwM4Jq8vE-ki5k3LgVbGBk",
    content: "Ótimo ponto. Acabei de subir o refinamento do feedback visual. Deem uma olhada no Figma quando puderem!",
    timestamp: "11:02"
  }
];

export const INITIAL_TEAM_HEALTH: TeamHealth = {
  climate: "Sereno",
  rechargeTime: "12h Restantes",
  mentalAlignment: "Alta Fluidez",
  empathyLevel: 88,
  collectiveSymmetry: 85,
  careSignals: '"O time está operando em maré alta, considere uma pausa coletiva amanhã. A energia sustentada requer momentos de calmaria para que a criatividade não se disperse."'
};
