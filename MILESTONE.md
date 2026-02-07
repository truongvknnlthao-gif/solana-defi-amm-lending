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
    └── 项目初始化、AMM 框架

Week 2：AMM 核心 ⏳ 当前
    └── Swap + Liquidity + 测试

Week 3：借贷核心 ⏭️
    └── 存款 + 借款 + 清算法

Week 4：前端 + 测试 ⏭️
    └── UI + 集成测试 + 部署
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

## 📅 Week 2：AMM 核心功能

### 周目标
完成 AMM 交易所核心功能

### 每日任务

#### Day 1-2：AMM 数学模型
```
任务：
├── 实现 Constant Product 公式: x * y = k
├── 计算 swap 输入输出
├── 处理手续费（0.3%）
└── 防止滑点过大

文件：
programs/amm/src/math.rs
programs/amm/src/instructions/swap.rs
```

#### Day 3：初始化与流动性
```
任务：
├── 创建流动性池（Pair Account）
├── 注入初始流动性
├── 计算 LP Token 数量
└── 验证池子状态

文件：
programs/amm/src/instructions/initialize_pool.rs
programs/amm/src/instructions/add_liquidity.rs
```

#### Day 4：Swap 交易
```
任务：
├── 实现 TokenA → TokenB 兑换
├── 实现 TokenB → TokenA 兑换
├── 计算汇率和手续费
├── 更新池子状态
└── 转账代币

文件：
programs/amm/src/instructions/swap.rs
```

#### Day 5：移除流动性
```
任务：
├── 实现 LP Token 销毁
├── 按比例取出两种代币
├── 验证 LP Token 余额
└── 更新池子状态

文件：
programs/amm/src/instructions/remove_liquidity.rs
```

### Week 2 交付物
```
✅ programs/amm/src/
│   ├── lib.rs
│   ├── math.rs
│   └── instructions/
│       ├── mod.rs
│       ├── initialize_pool.rs
│       ├── add_liquidity.rs
│       ├── swap.rs
│       └── remove_liquidity.rs
✅ tests/amm.ts（单元测试）
```

### 测试命令
```bash
# 开发测试
anchor test --skip-local-validator

# 单模块测试
anchor test --skip-build tests/amm.ts

# 查看账户
solana account <PAIR_ACCOUNT_ADDRESS>
```

---

## 📅 Week 3：借贷核心功能

### 周目标
完成借贷协议核心功能

### 每日任务

#### Day 1-2：借贷池初始化
```
任务：
├── 创建借贷池账户
├── 定义抵押率（Collateral Factor）
├── 设置清算阈值
└── 初始化利率模型

文件：
programs/lending/src/instructions/
├── initialize_market.rs
├── mod.rs
└── state/
    ├── market.rs
    └── obligation.rs
```

#### Day 3：存款功能
```
任务：
├── 用户存入 TokenA/B
├── 铸造存款凭证（cToken）
├── 累计利息
└── 更新用户余额

文件：
programs/lending/src/instructions/deposit.rs
```

#### Day 4：借款功能
```
任务：
├── 检查抵押物价值
├── 计算可借金额（基于抵押率）
├── 铸造债务代币
└── 更新借款池状态

文件：
programs/lending/src/instructions/borrow.rs
```

#### Day 5：还款与清算
```
任务：
├── 用户还款（本金 + 利息）
├── 销毁债务代币
├── 实现清算入口
├── 检查健康系数
└── 执行清算（拍卖抵押物）

文件：
programs/lending/src/instructions/
├── repay.rs
└── liquidate.rs
```

### Week 3 交付物
```
✅ programs/lending/src/
│   ├── lib.rs
│   ├── math.rs
│   ├── instructions/
│   │   ├── mod.rs
│   │   ├── initialize_market.rs
│   │   ├── deposit.rs
│   │   ├── borrow.rs
│   │   ├── repay.rs
│   │   └── liquidate.rs
│   └── state/
│       ├── market.rs
│       └── obligation.rs
✅ tests/lending.ts（单元测试）
```

### 核心机制说明

#### 抵押率示例
```
USDC 抵押率 = 80%
ETH 抵押率 = 70%

存入 100 USDC → 可借 80 USDC
存入 1 ETH ($3000) → 可借 2100 USDC
```

#### 清算机制
```
清算阈值 = 80%
健康系数 = 抵押物价值 / 借出金额

健康系数 < 80% → 可被清算

清算流程：
1. 清算人调用 liquidate()
2. 拍卖抵押物（通常 5-10% 折扣）
3. 清算人获得折扣抵押物
4. 债务减少
```

---

## 📅 Week 4：前端 + 测试 + 部署

### 周目标
完成 UI 界面、集成测试、Devnet 部署

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

### Week 2 ⏳ 检查
- [ ] AMM Swap 能工作
- [ ] Add/Remove Liquidity 正常
- [ ] 单元测试通过
- [ ] 代码无严重警告

### Week 3 ⏭️ 检查
- [ ] 存款/借款/还款正常
- [ ] 清算机制有效
- [ ] 借贷测试全部通过
- [ ] 安全性检查

### Week 4 ⏭️ 检查
- [ ] 前端 UI 完整
- [ ] 集成测试通过
- [ ] README 完整
- [ ] PR 已提交
- [ ] Demo 视频录制完成

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
2026-02-14  ⏳ Week 2 完成（AMM）
2026-02-21  ⏭️ Week 3 完成（借贷）
2026-02-28  ⏭️ Week 4 完成（前端+部署）
2026-03-01  🎯 提交 PR + Demo 视频
```

---

## 🎓 毕业设计检查清单

- [ ] GitHub repo 公开或私有
- [ ] README.md 完整
- [ ] 代码能编译运行
- [ ] 有测试用例
- [ ] Demo 视频（2-3 分钟）
- [ ] finalProject/demo.md 填写
- [ ] PR 提交到主仓库

---

**预计总代码量：** ~3000 行（Rust + TypeScript）

**祝开发顺利！** 🚀
