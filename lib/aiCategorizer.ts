const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Food & Dining": ["starbucks", "mcdonalds", "burger", "pizza", "coffee", "restaurant", "cafe", "deli", "supermarket", "grocery", "bakery", "food", "lunch", "dinner", "breakfast", "kfc", "dominos"],
  "Transportation": ["uber", "lyft", "taxi", "gas", "shell", "total", "petrol", "parking", "bus", "train", "metro", "airline", "flight", "car", "wash"],
  "Shopping": ["amazon", "ebay", "walmart", "target", "nike", "adidas", "zara", "h&m", "clothing", "shoes", "apple", "electronics"],
  "Utilities": ["electricity", "water", "internet", "comcast", "verizon", "ethio telecom", "wifi", "bill"],
  "Rent": ["rent", "landlord", "apartment", "house", "lease"],
  "Health": ["pharmacy", "doctor", "clinic", "hospital", "gym", "fitness", "dentist", "medical"],
  "Entertainment": ["netflix", "spotify", "steam", "cinema", "movie", "theater", "concert", "game", "bowling"],
  "Salary": ["salary", "payroll", "stipend", "bonus", "commission", "employer"],
  "Business": ["client", "freelance", "upwork", "fiverr", "stripe", "paypal", "invoice"],
};

export function autoCategorizeDescription(description: string): string | null {
  if (!description) return null;
  const lower = description.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }

  return null;
}
