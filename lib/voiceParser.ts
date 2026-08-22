export interface ParsedVoiceCommand {
  type: "income" | "expense";
  amount: number | null;
  currency: string;
  category: string;
  description: string;
}

const CATEGORY_MAP: Record<string, string> = {
  food: "Food",
  lunch: "Food",
  dinner: "Food",
  breakfast: "Food",
  coffee: "Food",
  restaurant: "Food",
  supermarket: "Food",
  groceries: "Food",
  pizza: "Food",

  transport: "Transportation",
  transportation: "Transportation",
  taxi: "Transportation",
  bus: "Transportation",
  gas: "Transportation",
  fuel: "Transportation",
  car: "Transportation",
  uber: "Transportation",

  shopping: "Shopping",
  clothes: "Shopping",
  shoes: "Shopping",
  electronics: "Shopping",

  rent: "Rent",
  house: "Rent",
  apartment: "Rent",

  electricity: "Utilities",
  water: "Utilities",
  internet: "Utilities",
  wifi: "Utilities",
  bill: "Utilities",

  health: "Health",
  doctor: "Health",
  pharmacy: "Health",
  medicine: "Health",
  gym: "Health",

  movie: "Entertainment",
  cinema: "Entertainment",
  game: "Entertainment",
  netflix: "Entertainment",
  music: "Entertainment",

  salary: "Salary",
  paycheck: "Salary",
  wage: "Salary",

  business: "Business",
  client: "Business",
  project: "Business",
};

export function parseVoiceCommand(transcript: string): ParsedVoiceCommand {
  const text = transcript.toLowerCase();

  // Detect Type
  let type: "income" | "expense" = "expense";
  if (text.includes("earned") || text.includes("received") || text.includes("income") || text.includes("got paid") || text.includes("salary")) {
    type = "income";
  }

  // Detect Amount (find numbers in string)
  const numberMatch = text.match(/\b\d+(\.\d+)?\b/);
  const amount = numberMatch ? parseFloat(numberMatch[0]) : null;

  // Detect Currency
  let currency = "USD";
  if (text.includes("birr") || text.includes("etb")) {
    currency = "ETB";
  } else if (text.includes("dollar") || text.includes("usd") || text.includes("$")) {
    currency = "USD";
  } else if (text.includes("euro") || text.includes("eur")) {
    currency = "EUR";
  } else if (text.includes("pound") || text.includes("gbp")) {
    currency = "GBP";
  }

  // Detect Category
  let category = type === "income" ? "Salary" : "Other";
  for (const [keyword, catName] of Object.entries(CATEGORY_MAP)) {
    if (text.includes(keyword)) {
      category = catName;
      break;
    }
  }

  // Clean description
  let description = transcript;
  if (description.length > 50) {
    description = description.substring(0, 50);
  }

  return {
    type,
    amount,
    currency,
    category,
    description: description.charAt(0).toUpperCase() + description.slice(1),
  };
}
