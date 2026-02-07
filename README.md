# Solana DeFi AMM + Lending Protocol

## 🎓 毕业设计项目 - Solana Bootcamp 2026 S1

> 组合型 DeFi 协议（AMM + Lending）
> GitHub: https://github.com/truongvknnlthao-gif/solana-defi-amm-lending

---

## 📚 文档

- **[README.md](./README.md)** - 项目概述和快速开始
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - 完整开发指南（必读）
- **[MILESTONE.md](./MILESTONE.md)** - 4 周开发计划

---

## 📊 项目状态

### ✅ 已完成模块

| 模块 | 状态 | Program ID | 说明 |
|------|------|------------|------|
| **AMM** | ✅ 完成 | `CZaKkKoLPHzcRXtm5q5X8YQNpr15ocASwgvW6krjFZex` | swap / add_liquidity / remove_liquidity / LP Token |
| **Lending** | ✅ 完成 | `8oCbnRgZnWRd1ctY3otZvwGqJpr8fG7b2atYFxqUAjxC` | deposit / borrow / repay（简化版） |

### 📁 项目结构

```
solana-defi-amm-lending/
├── programs/
│   ├── amm/                    # AMM 智能合约
│   │   ├── src/
│   │   │   ├── lib.rs         # 程序入口
│   │   │   ├── state/mod.rs   # AmmPool 状态
│   │   │   ├── math.rs        # AMM 数学计算
│   │   │   └── errors.rs      # 错误定义
│   │   └── Cargo.toml
│   │
│   └── lending/                # Lending 智能合约
│       ├── src/
│       │   ├── lib.rs         # 程序入口
│       │   ├── state/mod.rs   # LendingPool / Obligation
│       │   └── errors.rs      # 错误定义
│       └── Cargo.toml
│
├── tests/
│   ├── amm.ts                 # AMM 单元测试 (692 行)
│   └── lending.ts             # Lending 单元测试 (218 行)
│
├── app/                        # Next.js 前端 ⏳ Week 4 开发
│   ├── pages/
│   ├── components/
│   └── utils/
│
├── Anchor.toml                 # Anchor 配置
├── Cargo.toml                 # Rust 工作区配置
├── DEVELOPMENT.md             # 完整开发指南
├── MILESTONE.md              # 4 周开发计划
├── README.md                 # 本文档
└── package.json
```

---

## 🚀 快速开始

### 环境要求

```bash
# 检查版本
solana --version      # 4.0.0+
anchor --version      # 0.32.1+
rustc --version       # 1.95.0-nightly
```

### 构建项目

```bash
cd solana-defi-amm-lending

# 设置 Solana 路径
export PATH="/Users/bypasser/.local/share/solana/install/active_release/bin:$PATH"

# 构建
anchor build
```

### 构建产物

构建成功后，程序位于：
```
target/deploy/amm.so
```

Program ID:
```
CZaKkKoLPHzcRXtm5q5X8YQNpr15ocASwgvW6krjFZex
```

---

## 🛠️ 技术栈

| 组件 | 版本 |
|------|------|
| Solana CLI | 4.0.0 (Agave edge) |
| SBF Toolchain | v1.53 |
| Anchor | 0.32.1 |
| Rust | 1.95.0-nightly |
| Node.js | v22.22.0 |
| TypeScript | 5.x |

---

## 🚀 快速开始

### 环境要求

```bash
# 检查版本
solana --version      # 4.0.0+
anchor --version      # 0.32.1+
rustc --version       # 1.95.0-nightly
```

### 构建项目

```bash
cd solana-defi-amm-lending

# macOS PATH 配置
export PATH="/Users/bypasser/.local/share/solana/install/active_release/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

# 构建
anchor build
```

### 构建产物

| 模块 | 文件 | Program ID |
|------|------|------------|
| AMM | `target/deploy/amm.so` | `CZaKkKoLPHzcRXtm5q5X8YQNpr15ocASwgvW6krjFZex` |
| Lending | `target/deploy/lending.so` | `8oCbnRgZnWRd1ctY3otZvwGqJpr8fG7b2atYFxqUAjxC` |

---

## 📖 API 文档

### AMM 模块

#### initialize

初始化 AMM 资金池。

**参数：** `seed: u64`, `fee: u16`, `bump: u8`

#### swap

Token 交换。

**参数：** `amount_in: u64`, `minimum_amount_out: u64`

#### add_liquidity

添加流动性。

**参数：** `amount_a: u64`, `amount_b: u64`

#### remove_liquidity

移除流动性。

**参数：** `lp_amount: u64`

### Lending 模块（简化版）

#### initialize

初始化借贷池。

**参数：** `bump: u8`

#### initObligation

初始化用户的借款义务账户。

**参数：** 无

#### deposit

存入抵押品。

**参数：** `amount: u64`

#### borrow

借款。

**参数：** `amount: u64`

#### repay

还款。

**参数：** `amount: u64`

---

## 🧪 测试

```bash
# 启动本地测试网络
solana-test-validator

# 运行所有测试
anchor test

# AMM 测试
anchor test tests/amm.ts

# Lending 测试
anchor test tests/lending.ts
```

---

## 📅 开发计划

### Week 1: ✅ 基础架构
- [x] 项目初始化
- [x] Anchor 配置

### Week 2: ✅ AMM 核心
- [x] swap 指令
- [x] add/remove liquidity
- [x] LP Token 铸造
- [x] 单元测试

### Week 3: ✅ Lending 核心
- [x] initialize / initObligation
- [x] deposit / borrow / repay
- [x] 简化版（无清算）

### Week 4: ⏳ 前端 + 部署
- [x] Next.js 前端开发
- [x] 集成测试
- [ ] Devnet 部署 (等待空投)
- [x] README 完善

### 🚀 待部署 (需要 Devnet SOL)

```bash
# 服务器执行
ssh solana-dev
cd /data/workspace/solana-defi-amm-lending

# 1. 领取空投 (需要 2+ SOL)
solana airdrop 2

# 2. 配置 devnet
solana config set --url devnet

# 3. 部署程序
anchor deploy --provider.cluster devnet

# 4. 更新 Program IDs
```

---

## 📚 参考资料

### Solana 开发
- [Solana Docs](https://docs.solana.com/)
- [Solana Cookbook](https://solanacookbook.com/)

### Anchor Framework
- [Anchor Docs](https://www.anchor-lang.com/)
- [Anchor Examples](https://github.com/coral-xyz/anchor-examples)

### DeFi 参考
- [Uniswap V2](https://docs.uniswap.org/protocol/V2)
- [Aave Protocol](https://aave.com/)

---

## 📝 更新日志

### 2026-02-07
- ✅ AMM 模块完整实现
- ✅ Lending 模块实现（简化版）
- ✅ 两个模块构建成功
- ✅ 服务器环境验证通过

---

## 👤 作者

**truongvknnlthao-gif**

- GitHub: [@truongvknnlthao-gif](https://github.com/truongvknnlthao-gif)
- 项目: [solana-defi-amm-lending](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending)

---

## 📄 License

MIT
