# Solana 毕业设计项目 - 4 周开发计划

> 组合型 DeFi（AMM + 借贷）
> 创建日期：2026-02-07

---

## 📊 项目概览

| 项目 | 内容 |
|------|------|
| **项目名称** | Solana DeFi AMM + Lending |
| **GitHub** | https://github.com/truongvknnlthao-gif/solana-defi-amm-lending |
| **技术栈** | Rust + Anchor + Next.js + TypeScript |
| **预计周期** | 4 周（28 天） |
| **难度** | ⭐⭐⭐⭐ |

---

## 🎯 四周总览

```
Week 1：基础架构 ✅ 已完成
    └── 项目初始化、Anchor 配置

Week 2：AMM 核心功能 ✅ 已完成
    └── swap / add_liquidity / remove_liquidity / LP Token

Week 3：Lending 核心功能 ✅ 已完成
    └── deposit / borrow / repay（简化版）

Week 4：前端 + 部署 ✅ 已完成
    └── Next.js UI / 集成测试 / Devnet 部署（待完成）
```

---

## 📅 Week 1：基础架构 ✅ 已完成

### 完成内容
- [x] GitHub 仓库创建
- [x] Anchor 项目初始化
- [x] 工作区配置（workspace）
- [x] AMM 模块框架
- [x] Lending 模块框架
- [x] 测试文件结构

### 交付物
```
✅ solana-defi-amm-lending/
✅ programs/amm/src/lib.rs
✅ programs/lending/src/lib.rs
✅ tests/amm.ts
✅ tests/lending.ts
```

---

## 📅 Week 2：AMM 核心功能 ✅ 已完成

### 完成内容
- [x] swap 指令（更新 reserves）
- [x] add_liquidity 指令
- [x] remove_liquidity 指令
- [x] LP Token 铸造
- [x] AMM 数学模型（math.rs）
- [x] 单元测试（amm.ts - 643 行）

### 交付物
```
✅ programs/amm/src/lib.rs (329 行)
✅ programs/amm/src/state/mod.rs
✅ programs/amm/src/math.rs (470 行)
✅ programs/amm/src/errors.rs
✅ tests/amm.ts (643 行)
```

---

## 📅 Week 3：Lending 核心功能 ✅ 已完成

### 完成内容
- [x] initialize 指令
- [x] initObligation 指令
- [x] deposit 指令
- [x] borrow 指令
- [x] repay 指令
- [x] 简化版（无利息计算，无清算）
- [x] 单元测试（lending.ts - 169 行）

### 交付物
```
✅ programs/lending/src/lib.rs (311 行)
✅ programs/lending/src/state/mod.rs
✅ programs/lending/src/errors.rs
✅ tests/lending.ts (169 行)
```

---

## 📅 Week 4：前端 + 部署 ✅ 已完成

### 周目标 ✅
- [x] UI 界面（5个页面）
- [x] 集成测试
- [ ] Devnet 部署（等待空投）

### 每日任务

#### Day 1-2：前端开发
```
任务：
├── 钱包连接（Wallet Adapter）
├── 首页：展示池子信息
├── Swap 页面：代币兑换 UI
├── Pool 页面：流动性管理
├── Lending 页面：存款/借款/还款
└── 集成测试

文件：
app/
├── pages/
│   ├── index.tsx          # 首页
│   ├── swap.tsx           # Swap
│   ├── pool.tsx           # 流动性池
│   └── lending.tsx        # 借贷
├── components/
│   ├── WalletButton.tsx
│   ├── SwapForm.tsx
│   └── LendingForm.tsx
└── utils/
    ├── program.ts         # Anchor 客户端
    └── constants.ts
```

#### Day 3：集成测试
```
任务：
├── AMM 完整流程测试
├── 借贷完整流程测试
├── 边界条件测试
└── 错误处理测试

测试场景：
1. 创建池 → 注入流动性 → Swap → 移除流动性
2. 存款 → 借款 → 还款 → 清算（负向测试）
```

#### Day 4-5：部署与文档
```
任务：
├── 部署到 Devnet
├── 编写 README（项目介绍、功能、技术栈）
├── 录制 Demo 视频（2-3 分钟）
├── 填写 finalProject/demo.md
└── 提交 PR 到主仓库
```

### Week 4 交付物
```
✅ app/（前端完整）
├── pages/
├── components/
└── utils/
✅ README.md
✅ demo.md
✅ PR 提交
✅ Devnet 部署地址
```

---

## 🛠️ 每周检查点

### Week 1 ✅ 检查
- [x] GitHub repo 创建
- [x] Anchor 配置正确
- [x] 代码能编译
- [x] 本地测试网络能运行

### Week 2 ✅ 检查
- [x] AMM Swap 能工作
- [x] Add/Remove Liquidity 正常
- [x] LP Token 铸造正常
- [x] 单元测试编写完成
- [x] 代码无严重警告

### Week 3 ✅ 检查
- [x] Lending 模块代码完成
- [x] deposit/borrow/repay 正常
- [x] 两个模块构建成功
- [x] Program IDs 分配

### Week 4 ✅ 检查
- [x] 前端 UI 完整（5个页面）
- [x] 集成测试文件
- [x] README 完整
- [x] Git PR 已提交
- [ ] Demo 视频录制完成
- [ ] Devnet 部署（等待空投）

---

## 📚 学习资源

### AMM 参考
- [Uniswap V2 白皮书](https://uniswap.org/whitepaper.pdf)
- [Solana AMM 教程](https://www.soldev.co/course/solana-amm)

### 借贷协议参考
- [Aave 白皮书](https://aave.com/whitepaper)
- [Solana 借贷教程](https://beta.solpg.io/tutorials/lending)

### Anchor 官方
- [Anchor Docs](https://www.anchor-lang.com/)
- [Anchor Examples](https://github.com/coral-xyz/anchor-examples)

---

## 🚀 快速命令速查

### 日常开发
```bash
# 1. 启动本地测试网络
solana-test-validator

# 2. 构建
anchor build

# 3. 运行测试
anchor test

# 4. 部署到 Devnet
anchor deploy --provider.cluster devnet

# 5. 查看账户余额
solana balance <ADDRESS>
```

### 调试
```bash
# 查看程序日志
solana logs <PROGRAM_ADDRESS>

# 查看账户信息
solana account <ACCOUNT_ADDRESS> --output json
```

---

## ⚠️ 常见问题

### Q1: 程序报错 "Cross program invocation failed"
**原因：** CPI 调用失败  
**解决：** 检查目标程序地址、权限、账户派生

### Q2: 测试超时
**原因：** 本地 Validator 未启动  
**解决：** `solana-test-validator` 必须在后台运行

### Q3: 余额不足
**原因：** 测试代币不够  
**解决：** `solana airdrop 5` 获取测试代币

### Q4: 权限错误
**原因：** 签名权限不足  
**解决：** 检查 Anchor.toml 中的 `[programs.localnet]`

---

## 📈 里程碑时间线

```
2026-02-07  ✅ Week 1 完成
2026-02-07  ✅ Week 2 完成（AMM）
2026-02-07  ✅ Week 3 完成（Lending）
2026-02-07  ✅ Week 4 完成（前端+部署）
2026-02-07  ✅ Demo 视频录制（YouTube: s9E3Z4E9DEU）
2026-02-07  ✅ demo.md 填写完成
⏳  PR 提交到 bootcamp 仓库
⏳  毕业问卷填写
```

---

## 🎓 毕业设计检查清单

- [x] GitHub repo 创建（公开）
- [x] README.md 完整
- [x] 代码能编译运行
- [x] 测试用例完整（amm.ts 692行 + lending.ts 218行 + integration.ts 254行）
- [x] 前端 UI 完整（5个页面 + 3个组件）
- [x] demo.md 填写完成
- [x] Demo 视频（YouTube: s9E3Z4E9DEU）
- [x] 设计系统应用（Trust Blue + Action Orange）
- [x] 功能截图（4张）
- [ ] finalProject PR 提交
- [ ] 毕业问卷填写

---

**预计总代码量：** ~3000 行（Rust + TypeScript + 测试）

**祝开发顺利！** 🚀
