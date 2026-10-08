export type GamificationThemeKey =
  | "ALL"
  | "ANIMES"
  | "VEHICLES"
  | "ANIMALS"
  | "MOVIES_SERIES";

export interface GamificationThemeInfo {
  id: GamificationThemeKey;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
  samplePraise: string;
  sampleComparison: string;
}

export const GAMIFICATION_THEMES: Record<GamificationThemeKey, GamificationThemeInfo> = {
  ALL: {
    id: "ALL",
    label: "Todos (Misto)",
    emoji: "✨",
    tagline: "Universo aberto e variado",
    description: "Mistura surpresas de animes, carros, feras selvagens e clássicos do cinema a cada treino.",
    samplePraise: "Hoje até o Sr. Miyagi e o Tanjiro aplaudiriam de pé!",
    sampleComparison: "Você levantou 4 Porsches ou 1 Hipopótamo!",
  },
  ANIMES: {
    id: "ANIMES",
    label: "Animes",
    emoji: "⚔️",
    tagline: "Poder de luta e disciplina ninja",
    description: "Frases de Tanjiro, Rock Lee, Goku, Gojo e peso comparado a rochas gigantes e armaduras lendárias.",
    samplePraise: "Parabéns, hoje você treinou como o Tanjiro na Seleção Final!",
    sampleComparison: "Carga total equivale a 3 rochas gigantes cortadas pelo Tanjiro!",
  },
  VEHICLES: {
    id: "VEHICLES",
    label: "Veículos",
    emoji: "🏎️",
    tagline: "Potência, torque e velocidade bruta",
    description: "Comparações com Porsches, tanques de guerra, tratores e motores cortando giro no talo.",
    samplePraise: "Motor V12 biturbo cortando giro na reta de Interlagos!",
    sampleComparison: "Hoje você levantou o peso de 5 Porsches 911 ou 1 Tanque de Guerra!",
  },
  ANIMALS: {
    id: "ANIMALS",
    label: "Animais",
    emoji: "🦁",
    tagline: "Força da selva e instinto animal",
    description: "Comparações selvagens com hipopótamos, gorilas da montanha, rinocerontes e elefantes.",
    samplePraise: "Força bruta de gorila das montanhas: a selva toda respeitou seu treino!",
    sampleComparison: "Volume total equivalente a 1 Hipopótamo adulto e 2 leões!",
  },
  MOVIES_SERIES: {
    id: "MOVIES_SERIES",
    label: "Filmes & Séries",
    emoji: "🎬",
    tagline: "Grandes lendas da cultura pop",
    description: "Citações do Sr. Miyagi, Rocky Balboa, Exterminador do Futuro, Batman e DeLorean.",
    samplePraise: "Caramba, hoje até o Sr. Miyagi ficaria impressionado! Tira casaco, puxa ferro!",
    sampleComparison: "Você levantou o peso de 4 DeLoreans ou 1 T-Rex de Jurassic Park!",
  },
};

interface WeightItem {
  name: string;
  weightKg: number;
  prefix: string;
  category: GamificationThemeKey;
}

const THEMED_WEIGHT_ITEMS: WeightItem[] = [
  // Veículos
  { name: "Kart de Corrida", weightKg: 160, prefix: "um", category: "VEHICLES" },
  { name: "Moto Esportiva", weightKg: 210, prefix: "uma", category: "VEHICLES" },
  { name: "Fusca Clássico 1968", weightKg: 840, prefix: "um", category: "VEHICLES" },
  { name: "Porsche 911 GT3", weightKg: 1450, prefix: "um", category: "VEHICLES" },
  { name: "Picape Hilux 4x4", weightKg: 2200, prefix: "uma", category: "VEHICLES" },
  { name: "Caminhão de Bombeiros", weightKg: 8500, prefix: "um", category: "VEHICLES" },
  { name: "Ônibus Articulado", weightKg: 18000, prefix: "um", category: "VEHICLES" },
  { name: "Tanque de Guerra Blindado", weightKg: 55000, prefix: "um", category: "VEHICLES" },

  // Animais
  { name: "Leão Adulto", weightKg: 190, prefix: "um", category: "ANIMALS" },
  { name: "Gorila das Costas Prateadas", weightKg: 240, prefix: "um", category: "ANIMALS" },
  { name: "Urso Polar Gigante", weightKg: 550, prefix: "um", category: "ANIMALS" },
  { name: "Hipopótamo Adulto", weightKg: 1500, prefix: "um", category: "ANIMALS" },
  { name: "Rinoceronte Branco", weightKg: 2400, prefix: "um", category: "ANIMALS" },
  { name: "Elefante Africano", weightKg: 6000, prefix: "um", category: "ANIMALS" },
  { name: "Tubarão-Baleia", weightKg: 15000, prefix: "um", category: "ANIMALS" },
  { name: "Baleia Jubarte", weightKg: 35000, prefix: "uma", category: "ANIMALS" },

  // Animes
  { name: "Espada Buster do Cloud", weightKg: 40, prefix: "uma", category: "ANIMES" },
  { name: "Pesos de Tornozelo do Rock Lee", weightKg: 250, prefix: "um par de", category: "ANIMES" },
  { name: "Armadura de Ouro de Sagitário", weightKg: 450, prefix: "uma", category: "ANIMES" },
  { name: "Rocha Gigante cortada pelo Tanjiro", weightKg: 1800, prefix: "uma", category: "ANIMES" },
  { name: "Carro amassado pelo Goku", weightKg: 3200, prefix: "um", category: "ANIMES" },
  { name: "Robô Evangelion Unit-01", weightKg: 8500, prefix: "um", category: "ANIMES" },
  { name: "Titã Blindado de 15m", weightKg: 38000, prefix: "um", category: "ANIMES" },

  // Filmes & Séries
  { name: "Escudo do Capitão América + Moto Militar", weightKg: 180, prefix: "o", category: "MOVIES_SERIES" },
  { name: "DeLorean do De Volta para o Futuro", weightKg: 1250, prefix: "o", category: "MOVIES_SERIES" },
  { name: "Batmóvel Tumbler de Gotham", weightKg: 2500, prefix: "o", category: "MOVIES_SERIES" },
  { name: "T-Rex de Jurassic Park", weightKg: 8000, prefix: "o", category: "MOVIES_SERIES" },
  { name: "Caça Estelar X-Wing de Star Wars", weightKg: 22000, prefix: "um", category: "MOVIES_SERIES" },
  { name: "Monólito de Aço do Exterminador", weightKg: 50000, prefix: "o", category: "MOVIES_SERIES" },
];

const THEMED_PRAISES: Record<Exclude<GamificationThemeKey, "ALL">, string[]> = {
  ANIMES: [
    "Parabéns! Hoje você treinou como o Tanjiro na Seleção Final! ⚔️",
    "Caramba! O Rock Lee olhou sua disciplina e tirou os pesos das pernas pra aplaudir! 💥",
    "Vegeta mediu o poder desse treino: 'O ki dele é de mais de 8000!' 🔥",
    "Você sobreviveu à gravidade 100x na nave da Corporação Cápsula! 🚀",
    "Satoru Gojo aprovou seu treino com selo infinito: 'Você é o mais forte hoje!' 🤞",
    "All Might em pessoa confirmaria: 'Esse treino foi PLUS ULTRA!' 🌟",
    "Respiração da Hipertrofia, Décima Forma: Foco Absoluto e Sem Falhas! ⚡",
  ],
  VEHICLES: [
    "Motor V12 biturbo roncando alto e cortando giro na reta de Interlagos! 🏎️",
    "Você colocou tanta potência na barra que precisou acionar o controle de tração! 🏁",
    "Hoje você teve o torque monstruoso de um trator pesado em cada repetição! 🚜",
    "Ritmo de volta mais rápida da corrida: sem perder um milésimo de segundo! ⏱️",
    "Câmbio manual no talo, pé cravado no acelerador e tração total do início ao fim! ⚙️",
    "Hoje você moveu carga de tanque de guerra e deixou a pista em chamas! 🔥",
  ],
  ANIMALS: [
    "Força brutal de gorila das montanhas! A selva inteira respeitou seu treino! 🦍",
    "Hoje você teve a voracidade e a imponência de um leão em dia de caça! 🦁",
    "Resistência pura de rinoceronte: nada nem ninguém parou seu ímpeto! 🦏",
    "Pegada de urso polar gigante: cada série foi pura demonstração de soberania! 🐻",
    "Vigor e precisão de leopardo selvagem: execução cirúrgica e potente! 🐆",
  ],
  MOVIES_SERIES: [
    "Caramba, hoje até o Sr. Miyagi ficaria impressionado! 'Tira casaco, bota casaco, puxa ferro!' 🥋",
    "Rocky Balboa está tocando 'Eye of the Tiger' só pra comemorar suas séries! 🥊",
    "O Exterminador do Futuro mandou avisar: 'Hasta la vista, preguiça!' 🤖",
    "Batman já encomendou essa sua planilha pro treino na Batcaverna em Gotham! 🦇",
    "John Wick olhou seu foco e achou o comprometimento absoluto! ✏️",
    "Capitão América em pessoa diria: 'Eu posso fazer isso o dia todo!' 🛡️",
    "Morpheus confirmou: você definitivamente escolheu a pílula vermelha do ganho muscular! 💊",
  ],
};

export interface ThematicSummaryResult {
  theme: GamificationThemeKey;
  themeInfo: GamificationThemeInfo;
  praise: string;
  weightComparisonTitle: string;
  weightComparisonDetail: string;
  weightComparisonBadge: string;
  highlightStat: string;
}

/**
 * Gera elogio temático e equivalência de peso com base no volume em kg e no tema selecionado.
 */
export function getWorkoutThematicSummary(
  totalVolumeInKg: number,
  themePreference: GamificationThemeKey = "ALL",
  seed = 0
): ThematicSummaryResult {
  const effectiveTheme: Exclude<GamificationThemeKey, "ALL"> =
    themePreference === "ALL"
      ? (["ANIMES", "VEHICLES", "ANIMALS", "MOVIES_SERIES"][
          Math.abs(seed) % 4
        ] as Exclude<GamificationThemeKey, "ALL">)
      : themePreference;

  const praises = THEMED_PRAISES[effectiveTheme];
  const praiseIndex = Math.abs(seed) % praises.length;
  const praise = praises[praiseIndex];

  // Filtra itens de peso pelo tema ou todos se preferência for ALL
  const candidateItems =
    themePreference === "ALL"
      ? THEMED_WEIGHT_ITEMS
      : THEMED_WEIGHT_ITEMS.filter((item) => item.category === effectiveTheme);

  // Encontra a melhor equivalência
  const safeVolume = Math.max(totalVolumeInKg, 20);

  // Ordena por quão próximo o peso chega (ou múltiplos)
  let bestItem = candidateItems[0];
  let bestCount = 1;

  // Tenta encontrar um item que divida bem o volume
  for (const item of candidateItems) {
    const ratio = safeVolume / item.weightKg;
    if (ratio >= 0.8 && ratio <= 15) {
      bestItem = item;
      bestCount = Math.max(1, Math.round(ratio));
      break;
    }
  }

  // Se não achou na faixa 0.8 a 15, pega o item mais próximo
  if (!bestItem) {
    bestItem = candidateItems[Math.abs(seed) % candidateItems.length];
    bestCount = Math.max(1, Math.round(safeVolume / bestItem.weightKg));
  }

  let countText = "";
  if (bestCount === 1) {
    countText = `${bestItem.prefix} ${bestItem.name}`;
  } else {
    countText = `${bestCount}x ${bestItem.name}s`;
  }

  const comparisonTitle = `Hoje você levantou o equivalente a ${countText}!`;
  const comparisonDetail = `Seu volume total de ${Math.round(
    safeVolume
  ).toLocaleString("pt-BR")} kg equivale à carga de ${countText} (peso base: ~${bestItem.weightKg.toLocaleString("pt-BR")} kg cada).`;

  return {
    theme: themePreference,
    themeInfo: GAMIFICATION_THEMES[themePreference] ?? GAMIFICATION_THEMES.ALL,
    praise,
    weightComparisonTitle: comparisonTitle,
    weightComparisonDetail: comparisonDetail,
    weightComparisonBadge: `${bestItem.name}`,
    highlightStat: `${Math.round(safeVolume).toLocaleString("pt-BR")} kg`,
  };
}
