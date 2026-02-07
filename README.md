# Solana DeFi AMM Protocol

## 🎓 毕业设计项目 - Solana Bootcamp 2026 S1

> 组合型 DeFi 协议（AMM 模块）
> GitHub: https://github.com/truongvknnlthao-gif/solana-defi-amm-lending

---

## 📊 项目状态

### ✅ 已完成

| 模块 | 状态 | 说明 |
|------|------|------|
| AMM Initialize | ✅ 完成 | 初始化 AMM 资金池 |
| AMM Swap | ✅ 完成 | Token 交换功能 |
| AMM Add Liquidity | ✅ 完成 | 添加流动性 |
| 构建成功 | ✅ 完成 | Program ID: `CZaKkKoLPHzcRXtm5q5X8YQNpr15ocASwgvW6krjFZex` |

### ⏳ 开发中

| 模块 | 状态 | 说明 |
|------|------|------|
| AMM Remove Liquidity | 🔄 待实现 | 移除流动性 |
| LP Token 铸造 | 🔄 待实现 | 流动性凭证 |
| Lending 模块 | ⏸️ 已禁用 | 需要单独修复 |
| 前端 UI | ⏳ 待开始 | Next.js |
| 集成测试 | ⏳ 待开始 | 测试用例 |

### ⚠️ 已知问题

- Lending 模块编译失败（临时禁用）
- `initialize` 指令需要客户端单独创建 vault 账户
- 有 `anchor-debug` cfg 警告（不影响功能）

---

## 🛠️ 技术栈

| 组件 | 版本 |
|------|------|
| Solana CLI | 4.0.0 (edge) |
| SBF Toolchain | v1.53 |
| Anchor | 0.30.1 |
| Rust | 1.89.0-sbpf |
| Node.js | 22.22.0 |

---

## 📁 项目结构

```
solana-defi-amm-lending/
├── programs/
│   └── amm/                    # AMM 智能合约
│       ├── src/
│       │   ├── lib.rs         # 程序入口（含所有指令）
│       │   ├── state.rs      # AmmPool 状态账户
│       │   ├── math.rs       # AMM 数学计算
│       │   └── errors.rs     # 错误定义
│       └── Cargo.toml
│
├── target/
│   └── deploy/
│       └── amm.so             # 编译后的程序
│
├── Anchor.toml                 # Anchor 配置
├── Cargo.toml                # Rust 工作区配置
├── package.json
└── tsconfig.json
```

---

## 🚀 快速开始

### 环境要求

```bash
# 检查版本
solana --version      # 需要 4.0.0+
anchor --version     # 需要 0.30.1+
rustc --version       # 需要 nightly-sbpf
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

## 📖 API 文档

### initialize

初始化 AMM 资金池。

**指令参数：**
- `seed: u64` - 池子种子
- `fee: u16` - 交易手续费 (例如: 30 = 0.3%)
- `bump: u8` - PDA bump

**账户：**
- `authority` - 池子所有者
- `amm_pool` - AMM 池子账户
- `token_a_mint` - Token A Mint
- `token_b_mint` - Token B Mint
- `token_a_vault` - Token A Vault
- `token_b_vault` - Token B Vault
- `system_program` - 系统程序

### swap

在 AMM 池子中交换 Token。

**指令参数：**
- `amount_in: u64` - 输入数量
- `minimum_amount_out: u64` - 最小输出数量（滑点保护）

**账户：**
- `user` - 用户
- `amm_pool` - AMM 池子
- `user_token_a/b` - 用户 Token 账户
- `token_a/b_vault` - 池子 Vault
- `token_program` - Token 程序

### add_liquidity

向 AMM 池子添加流动性。

**指令参数：**
- `amount_a: u64` - Token A 数量
- `amount_b: u64` - Token B 数量

**账户：**
- `provider` - 流动性提供者
- `amm_pool` - AMM 池子
- `provider_token_a/b` - 提供者 Token 账户
- `token_a/b_vault` - 池子 Vault
- `token_program` - Token 程序

---

## 🧪 测试

```bash
# 启动本地测试网络
solana-test-validator

# 运行测试（需要先编写测试文件）
anchor test
```

---

## 📅 开发计划

### Week 1: ✅ 已完成
- [x] 项目初始化
- [x] AMM 核心逻辑
- [x] 构建成功

### Week 2: 🔄 进行中
- [ ] Remove Liquidity
- [ ] LP Token 铸造
- [ ] 单元测试

### Week 3: ⏳ 待开始
- [ ] 修复 Lending 模块
- [ ] 借贷核心功能

### Week 4: ⏳ 待开始
- [ ] 前端 UI
- [ ] 集成测试
- [ ] 部署文档

---

## 🔧 常见问题

### Q1: 构建失败 "frame size too large"

**问题：** 帧空间超出限制（>4096 字节）

**解决：**
- 简化 Initialize 结构体
- 移除不必要的账户验证
- 使用 `UncheckedAccount` 替代 `Account`

### Q2: Anchor 版本不匹配

**问题：** CLI 0.32.1 vs 代码 0.30.1

**解决：**
```toml
# 在 Anchor.toml 中添加
[toolchain]
anchor_version = "0.30.1"
```

### Q3: `cargo-build-sbf` 找不到

**问题：** Solana SDK 路径错误

**解决：**
```bash
export PATH="/Users/bypasser/.local/share/solana/install/active_release/bin:$PATH"
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
- [Solana AMM Tutorial](https://www.soldev.co/course/solana-amm)

---

## 📝 更新日志

### 2026-02-07
- ✅ 完成 AMM 核心模块
- ✅ 成功构建
- ⚠️ 禁用 Lending 模块（需要修复）

---

## 👤 作者

**truongvknnlthao-gif**

- GitHub: [@truongvknnlthao-gif](https://github.com/truongvknnlthao-gif)
- 项目: [solana-defi-amm-lending](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending)

---

## 📄 License

MIT
