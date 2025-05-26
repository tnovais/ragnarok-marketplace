export const RAGNAROK_SERVERS = [
  { id: 1, name: "Thor" },
  { id: 2, name: "Odin" },
  { id: 3, name: "Loki" },
  { id: 4, name: "Freya" },
  { id: 5, name: "Chaos" },
  { id: 6, name: "Iris" },
];

export const ITEM_CATEGORIES = [
  { id: 1, name: "Zeny" },
  { id: 2, name: "Armas" },
  { id: 3, name: "Armaduras" },
  { id: 4, name: "Cartas" },
  { id: 5, name: "Acessórios" },
  { id: 6, name: "Consumíveis" },
  { id: 7, name: "Materiais" },
  { id: 8, name: "Outros" },
];

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  PAID: "paid", 
  DELIVERED: "delivered",
  COMPLETED: "completed",
  DISPUTED: "disputed",
  CANCELLED: "cancelled",
} as const;

export const TRANSACTION_STATUS_LABELS = {
  [TRANSACTION_STATUS.PENDING]: "Pendente",
  [TRANSACTION_STATUS.PAID]: "Pago",
  [TRANSACTION_STATUS.DELIVERED]: "Entregue",
  [TRANSACTION_STATUS.COMPLETED]: "Concluído",
  [TRANSACTION_STATUS.DISPUTED]: "Em Disputa",
  [TRANSACTION_STATUS.CANCELLED]: "Cancelado",
};

export const FEE_RATES = {
  STANDARD_LOW: 0.15, // Below R$200
  STANDARD_HIGH: 0.10, // Above R$200
  PROMOTED: 0.06, // Promoted listings
  THRESHOLD: 200, // Threshold for fee rate change
  PROMOTION_COST: 20, // Monthly promotion cost
};

export const PLACEHOLDER_IMAGES = {
  ITEM: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  WEAPON: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  ARMOR: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  ACCESSORY: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  GOLD: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
};

export const SUPPORT_LINKS = {
  HOW_IT_WORKS: "/como-funciona",
  DISPUTES: "/disputas",
  FEES: "/taxas",
  CONTACT: "/contato",
  TERMS: "/termos",
  PRIVACY: "/privacidade",
  RULES: "/regras",
};
