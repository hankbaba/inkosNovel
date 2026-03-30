import { describe, expect, it } from "vitest";
import { evaluateHookAdmission } from "./packages/core/src/utils/hook-governance.js";

describe("验证钩子冲突修复", () => {
  it("H001 和 H008 不应该冲突（类型相同但内容无关）", () => {
    const h001 = {
      hookId: "H001",
      type: "设定伏笔",
      status: "open",
      startChapter: 1,
      lastAdvancedChapter: 1,
      expectedPayoff: "35",
      notes: "蚀月渊小头目砸门时掉落的古神图腾碎片，是后续解析古神力量的关键样本"
    };

    const h008 = {
      type: "设定伏笔",
      expectedPayoff: "待定",
      notes: "柜台左下角刻字\"离域即死，慎之\"（裴殊穿越初期所留）被麻布擦拭变淡，提醒离域即死"
    };

    const decision = evaluateHookAdmission({
      candidate: h008,
      activeHooks: [h001]
    });

    // 修复后应该 admit = true
    expect(decision.admit).toBe(true);
    expect(decision.reason).toBe("admit");
  });

  it("真正重复的内容仍然应该被检测到", () => {
    const h001 = {
      hookId: "H001",
      type: "设定伏笔",
      status: "open",
      startChapter: 1,
      lastAdvancedChapter: 1,
      expectedPayoff: "35",
      notes: "蚀月渊小头目砸门时掉落的古神图腾碎片，是后续解析古神力量的关键样本"
    };

    const h001_duplicate = {
      type: "设定伏笔",
      expectedPayoff: "35",
      notes: "蚀月渊小头目砸门时掉落的古神图腾碎片"
    };

    const decision = evaluateHookAdmission({
      candidate: h001_duplicate,
      activeHooks: [h001]
    });

    // 真正的重复仍然应该被检测到
    expect(decision.admit).toBe(false);
    expect(decision.reason).toBe("duplicate_family");
    expect(decision.matchedHookId).toBe("H001");
  });
});
