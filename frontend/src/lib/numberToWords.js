const ONES_EN = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS_EN = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const ONES_BN = ["", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ", "এগারো", "বারো", "তেরো", "চোদ্দো", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ"];
const TENS_BN = ["", "", "কুড়ি", "ত্রিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বী"];

function convertGroupEN(n) {
  if (n === 0) return "";
  if (n < 20) return ONES_EN[n];
  if (n < 100) return TENS_EN[Math.floor(n / 10)] + (n % 10 ? " " + ONES_EN[n % 10] : "");
  return ONES_EN[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertGroupEN(n % 100) : "");
}

function convertGroupBN(n) {
  if (n === 0) return "";
  if (n < 20) return ONES_BN[n];
  if (n < 100) return TENS_BN[Math.floor(n / 10)] + (n % 10 ? " " + ONES_BN[n % 10] : "");
  return ONES_BN[Math.floor(n / 100)] + " শত" + (n % 100 ? " " + convertGroupBN(n % 100) : "");
}

function numberToWordsEN(num) {
  if (num === 0) return "Zero";
  const ones = ["", "Thousand", "Million", "Billion", "Trillion"];
  let result = "";
  let groupIndex = 0;
  while (num > 0) {
    const group = num % 1000;
    if (group !== 0) {
      const groupWords = convertGroupEN(group);
      result = groupWords + (ones[groupIndex] ? " " + ones[groupIndex] : "") + (result ? " " + result : "");
    }
    num = Math.floor(num / 1000);
    groupIndex++;
  }
  return result.trim();
}

function numberToWordsBN(num) {
  if (num === 0) return "শূন্য";
  const ones = ["", "হাজার", "লক্ষ", "কোটি", "ট্রিলিয়ন"];
  let result = "";
  let groupIndex = 0;
  while (num > 0) {
    const group = num % 1000;
    if (group !== 0) {
      const groupWords = convertGroupBN(group);
      result = groupWords + (ones[groupIndex] ? " " + ones[groupIndex] : "") + (result ? " " + result : "");
    }
    num = Math.floor(num / 1000);
    groupIndex++;
  }
  return result.trim();
}

export function convertToWords(amount, lang = "en") {
  const num = Math.abs(Math.round(amount));
  const decimals = Math.round((Math.abs(amount) - num) * 100);

  if (lang === "bn") {
    const words = numberToWordsBN(num);
    const poisha = decimals > 0 ? " " + numberToWordsBN(decimals) + " পয়সা" : "";
    return words + " টাকা" + poisha + " মাত্র";
  }

  const words = numberToWordsEN(num);
  const poisha = decimals > 0 ? " and " + decimals + "/100" : "";
  return words + " Taka" + poisha + " Only";
}
