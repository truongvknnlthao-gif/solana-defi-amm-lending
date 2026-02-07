# Solana DeFi AMM + Lending Protocol

## 项目概述

本项目是一个基于 Solana 区块链的组合型 DeFi 协议，实现了自动做市商（AMM）和借贷功能。作为毕业设计项目，该协议旨在学习和实践 Solana 开发的核心概念。

## 技术栈

- **区块链**: Solana 1.18+
- **智能合约框架**: Anchor 0.32.1
- **编程语言**: Rust (智能合约), TypeScript (前端 & 测试)
- **前端框架**: Next.js 14
- **钱包适配器**: Solana Wallet Adapter
- **开发工具**: Node.js 22, Yarn

## 功能列表

### AMM 模块
- [x] 初始化 AMM 资金池
- [x] Token 交换 (Swap)
- [x] 添加流动性 (Add Liquidity)
- [ ] 移除流动性 (Remove Liquidity) - 待实现
- [ ] LP Token 铸造 - 待实现

### 借贷模块
- [x] 存款 (Deposit)
- [x] 借款 (Borrow)
- [x] 还款 (Repay)
- [ ] 清算机制 (Liquidation) - 待实现
- [ ] 利率模型 - 待实现

## 开发计划 (4 周)

### 第 1 周：项目初始化 & AMM 核心
- [x] 创建项目结构
- [x] 配置 Anchor 开发环境
- [x] 实现 AMM 初始化指令
- [x] 实现 Swap 指令
- [x] 实现 Add Liquidity 指令

### 第 2 周：AMM 完善 & 借贷核心
- [ ] 实现 Remove Liquidity 指令
- [ ] 编写 AMM 单元测试
- [ ] 实现借贷池初始化
- [ ] 实现 Deposit 指令
- [ ] 实现 Borrow 指令

### 第 3 周：借贷完善 & 集成测试
- [ ] 实现 Repay 指令
- [ ] 实现清算机制
- [ ] 编写借贷单元测试
- [ ] 集成测试 AMM + 借贷
- [ ] 前端基础架构搭建

### 第 4 周：前端开发 & 文档
- [ ] Next.js 前端开发
- [ ] UI/UX 优化
- [ ] 部署到 Devnet
- [ ] 编写完整文档
- [ ] 准备答辩材料

## 项目结构

```
solana-defi-amm-lending/
├── programs/
│   ├── amm/                    # AMM 智能合约
│   │   ├── src/
│   │   │   ├── lib.rs         # 程序入口
│   │   │   ├── instructions/  # 指令实现
│   │   │   │   ├── initialize.rs
│   │   │   │   ├── swap.rs
│   │   │   │   └── add_liquidity.rs
│   │   │   └── state/         # 状态账户
│   │   └── Cargo.toml
│   │
│   ├── lending/               # 借贷智能合约
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── instructions/
│   │   │   │   ├── deposit.rs
│   │   │   │   ├── borrow.rs
│   │   │   │   └── repay.rs
│   │   │   └── state/
│   │   └── Cargo.toml
│   │
│   └── lib.rs                 # 工作区主入口
│
├── app/                       # Next.js 前端
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── styles/
│
├── tests/                     # 集成测试
│   ├── amm.ts
│   └── lending.ts
│
├── Anchor.toml                # Anchor 配置
├── Cargo.toml                # Rust 工作区配置
├── package.json              # Node.js 依赖
└── tsconfig.json             # TypeScript 配置
```

## 参考资料

### Solana 开发
- [Solana Docs](https://docs.solana.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Program Library](https://spl.solana.com/)

### Anchor Framework
- [Anchor Docs](https://www.anchor-lang.com/)
- [Anchor GitHub](https://github.com/coral-xyz/anchor)

### DeFi 协议参考
- [Uniswap V2](https://docs.uniswap.org/protocol/V2/concepts/protocol-overview)
- [Compound Finance](https://docs.compound.finance/)
- [Raydium](https://raydium.gitbook.io/raydium/)

### 学习资源
- [Patrick Collins Foundry Course](https://github.com/Cyfrin/foundry-full-course-cu)
- [Solana Bootcamp](https://www.soldev.co/)

## 快速开始

### 环境要求
- Rust 1.75+
- Solana CLI 1.18+
- Anchor 0.32.1
- Node.js 18+
- Yarn

### 安装依赖

```bash
# 安装 Rust 工具链
rustup install 1.75.0

# 安装 Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# 安装 Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli --locked

# 安装 Node.js 依赖
yarn install
```

### 构建项目

```bash
# 构建智能合约
anchor build

# 安装前端依赖
yarn install
```

### 运行测试

```bash
# 运行所有测试
anchor test

# 或运行特定模块测试
ts-mocha -p ./tsconfig.json -t 1000000 tests/amm.ts
ts-mocha -p ./tsconfig.json -t 1000000 tests/lending.ts
```

### 启动本地集群

```bash
# 启动 Solana 本地测试网络
solana-test-validator

# 在新终端运行开发服务器
yarn dev
```

## License

MIT

## 作者

truongvknnlthao-gif
