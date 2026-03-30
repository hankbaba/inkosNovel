import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 动态加载编译后的 JS
const { evaluateHookAdmission } = await import(join(__dirname, 'packages/core/dist/utils/hook-governance.js'));

console.log("=== 验证钩子冲突算法修复 ===");
console.log();

// 测试用例：H001 和 H008（应该不再冲突！）
const h001 = {
  hookId: "H001",
  type: "设定伏笔",
  status: "open",
  expectedPayoff: "35",
  notes: "蚀月渊小头目砸门时掉落的古神图腾碎片，是后续解析古神力量的关键样本"
};

const h008 = {
  type: "设定伏笔",
  expectedPayoff: "待定",
  notes: "柜台左下角刻字\"离域即死，慎之\"（裴殊穿越初期所留）被麻布擦拭变淡，提醒离域即死"
};

console.log("H001:", h001.notes);
console.log("H008:", h008.notes);
console.log();

const decision = evaluateHookAdmission({
  candidate: h008,
  activeHooks: [h001]
});

console.log("判定结果:", decision);
console.log();

if (decision.admit) {
  console.log("✅ 修复成功！H008 现在可以正常添加了");
  console.log("   （两个钩子类型相同但内容无关，不再误判为冲突）");
} else {
  console.log("❌ 仍然冲突，修复失败");
}
console.log();

// 再测试真正的重复（应该仍然会被检测到）
console.log("--- 测试真正的重复 ---");
const h001_duplicate = {
  type: "设定伏笔",
  expectedPayoff: "35",
  notes: "蚀月渊小头目砸门时掉落的古神图腾碎片"
};

const decision2 = evaluateHookAdmission({
  candidate: h001_duplicate,
  activeHooks: [h001]
});

console.log("重复内容判定结果:", decision2);
console.log();

if (!decision2.admit && decision2.reason === "duplicate_family") {
  console.log("✅ 真正的重复仍然能正确检测到");
} else {
  console.log("❌ 真正的重复没有检测到");
}
