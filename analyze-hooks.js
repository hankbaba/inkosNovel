// 分析钩子冲突
function normalizeText(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractChineseBigrams(value) {
  const segments = value.match(/[\u4e00-\u9fff]+/g) ?? [];
  const terms = new Set();

  for (const segment of segments) {
    if (segment.length < 2) continue;
    for (let index = 0; index <= segment.length - 2; index += 1) {
      terms.add(segment.slice(index, index + 2));
    }
  }
  return terms;
}

// snapshot-0 中的 H001
const h001 = {
  type: "设定伏笔",
  expectedPayoff: "35",
  notes: "蚀月渊小头目砸门时掉落的古神图腾碎片，是后续解析古神力量的关键样本"
};

// 用户提供的 H008
const h008 = {
  type: "设定伏笔",
  expectedPayoff: "待定",
  notes: "柜台左下角刻字\"离域即死，慎之\"（裴殊穿越初期所留）被麻布擦拭变淡，提醒离域即死"
};

console.log("=== 钩子冲突分析 ===");
console.log();
console.log("H001:", h001.notes);
console.log("H008:", h008.notes);
console.log();

const h001_normalized = normalizeText([h001.type, h001.expectedPayoff, h001.notes].join(" "));
const h008_normalized = normalizeText([h008.type, h008.expectedPayoff, h008.notes].join(" "));

const h001_bigrams = extractChineseBigrams(h001_normalized);
const h008_bigrams = extractChineseBigrams(h008_normalized);

const overlap = [...h008_bigrams].filter(b => h001_bigrams.has(b));

console.log("H001 二元组:", [...h001_bigrams]);
console.log();
console.log("H008 二元组:", [...h008_bigrams]);
console.log();
console.log("重叠二元组 (" + overlap.length + "):", overlap);
console.log();

console.log("========== 结论 ==========");
console.log();
console.log("这两个钩子内容完全不相关！");
console.log("一个是关于古神图腾碎片，另一个是关于离域即死警告");
console.log();
console.log("如果 H008 真的和 H001 冲突了，那只有两种可能：");
console.log("1. LLM 实际输出的 H008 不是这个『离域即死』的钩子");
console.log("2. 冲突算法有 bug（比如通用词导致的误判）");
console.log();
console.log("让我们看看重叠的二元组:", overlap);
