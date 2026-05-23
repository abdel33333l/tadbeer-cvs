const flagMap = {
  "Uganda": "🇺🇬",
  "Ethiopia": "🇪🇹",
  "Philippines": "🇵🇭",
  "Indonesia": "🇮🇩",
  "Sri Lanka": "🇱🇰",
  "Kenya": "🇰🇪",
  "Ghana": "🇬🇭",
  "India": "🇮🇳",
  "Nepal": "🇳🇵",
  "Bangladesh": "🇧🇩",
  "Madagascar": "🇲🇬",
  "Sierra Leone": "🇸🇱",
  "Nigeria": "🇳🇬",
};

export const getFlagEmoji = (nationality) => {
  return flagMap[nationality] || "🏳️";
};
