# Solana DeFi AMM Protocol - 开发完整指南

## 🎓 毕业设计项目 - Solana Bootcamp 2026 S1

> 组合型 DeFi 协议（AMM 模块）
> GitHub: https://github.com/truongvknnlthao-gif/solana-defi-amm-lending

---

## 📋 目录

1. [项目背景](#项目背景)
2. [环境配置](#环境配置)
3. [项目架构](#项目架构)
4. [开发历程](#开发历程)
5. [遇到的问题及解决方案](#遇到的问题及解决方案)
6. [代码规范](#代码规范)
7. [测试指南](#测试指南)
8. [部署步骤](#部署步骤)
9. [常见问题](#常见问题)
10. [未来待办](#未来待办)
11. [参考资料](#参考资料)

---

## 📖 项目背景

### 为什么做这个项目？

作为 Solana Bootcamp 2026 S1 的毕业设计，需要综合运用课程所学内容：
- ✅ SPL Token
- ✅ Anchor Framework
- ✅ Pinocchio Framework  
- ✅ CPI (Cross-Program Invocation)
- ✅ 测试工具 (LiteSVM, SurfPool, Mollusk)

### 项目目标

创建一个组合型 DeFi 协议，包含：
1. **AMM 模块** - 自动做市商 ✅ 已完成
2. **Lending 模块** - 借贷协议 ✅ 已完成（简化版）

### 为什么选择 AMM + Lending？

- ✅ 技术栈覆盖全面
- ✅ 市场需求大
- ✅ 面试加分项
- ✅ 可参加黑客松竞赛

---

## 🛠️ 环境配置

### 必需软件

```bash
# 1. Rust 工具链
rustup install 1.89.0
rustup target add sbpf-linker --toolchain nightly

# 2. Solana CLI (edge 版本)
agave-install init edge
export PATH="/Users/bypasser/.local/share/solana/install/active_release/bin:$PATH"

# 3. Anchor Framework
# 使用 AVM 管理版本
avm install 0.30.1
avm use 0.30.1

# 4. Node.js
node --version  # 需要 v18+
npm --version    # 需要 v9+

# 5. Yarn
yarn --version   # 需要 v1.22+
```

### 关键版本信息

| 组件 | macOS | 服务器 | 说明 |
|------|-------|--------|------|
| Solana CLI | 4.0.0 (Agave) | 4.0.0 (Agave) | edge 版本 |
| SBF Toolchain | v1.53 | v1.53 | 支持 Rust edition2024 |
| Anchor | 0.32.1 | 0.32.1 | 与 Solana SDK 兼容 |
| Rust | 1.95.0-nightly | 1.95.0-nightly | Solana 定制版 |
| Node.js | v22.22.0 | v22.22.0 | 当前 LTS |
| Yarn | 1.22.22 | 1.22.22 | 包管理器 |

### macOS PATH 配置

```bash
# Solana CLI (agave-install)
export PATH="/Users/bypasser/.local/share/solana/install/active_release/bin:$PATH"

# Rust/Cargo
export PATH="$HOME/.cargo/bin:$PATH"
```

### Linux (Ubuntu/Debian) 配置

```bash
# 安装依赖
sudo apt-get update
sudo apt-get install -y libusb-1.0-0-dev

# 配置 Rust
rustup install 1.89.0
rustup target add sbpf-linker --toolchain nightly
```

---

## 🏗️ 项目架构

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  ┌───────────┐  ┌───────────┐  ┌───────────────────┐   │
│  │  Wallet   │  │   Swap    │  │   Liquidity      │   │
│  │  Adapter  │  │   Page     │  │    Page           │   │
│  └─────┬─────┘  └─────┬─────┘  └─────────┬─────────┘   │
└────────┼──────────────┼────────────────────┼─────────────┘
         │              │                    │
         └──────────────┴────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Solana Programs                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              AMM Program                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────┐   │   │
│  │  │Init     │ │Swap     │ │Add Liquidity│   │   │
│  │  └─────────┘ └─────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Lending Program (待修复)              │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │Deposit  │ │Borrow   │ │Repay    │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   On-Chain Accounts                     │
│  ┌───────────────┐  ┌─────────────────────────────┐ │
│  │    AmmPool     │  │       LendingPool          │ │
│  │  - reserves    │  │  - collateral ratio        │ │
│  │  - fees       │  │  - interest rate            │ │
│  │  - lp supply  │  │  - obligations              │ │
│  └───────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### AMM 模块架构

```
AMM Program (amm)
│
├── State (状态账户)
│   └── AmmPool
│       ├── seed: u64
│       ├── bump: u8
│       ├── fee: u16 (手续费率)
│       ├── token_a_mint: Pubkey
│       ├── token_b_mint: Pubkey
│       ├── token_a_vault: Pubkey
│       ├── token_b_vault: Pubkey
│       ├── lp_token_supply: u64
│       ├── reserve_a: u64
│       └── reserve_b: u64
│
├── Instructions (指令)
│   ├── initialize(seed, fee, bump)
│   │   └─ 创建 AmmPool 账户
│   │
│   ├── swap(amount_in, minimum_amount_out)
│   │   └─ Token 交换 (恒定乘积公式)
│   │
│   └── add_liquidity(amount_a, amount_b)
│       └─ 添加流动性
│
└── Math (数学计算)
    ├── calculate_swap_output()
    ├── calculate_swap_input()
    ├── calculate_lp_tokens_mint()
    └── calculate_lp_tokens_burn()
```

### 账户结构

```
┌─────────────────────────────────────────────────────────┐
│                    Initialize 账户                       │
├─────────────────────────────────────────────────────────┤
│  authority: Signer<'info>                               │
│  amm_pool: Account<'info, AmmPool>                     │
│  token_a_mint: UncheckedAccount<'info>                  │
│  token_b_mint: UncheckedAccount<'info>                  │
│  token_a_vault: UncheckedAccount<'info>                 │
│  token_b_vault: UncheckedAccount<'info>                 │
│  system_program: Program<'info, System>                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      Swap 账户                          │
├─────────────────────────────────────────────────────────┤
│  user: Signer<'info>                                   │
│  amm_pool: Account<'info, AmmPool>                     │
│  user_token_a: Account<'info, TokenAccount>           │
│  user_token_b: Account<'info, TokenAccount>           │
│  token_a_vault: Account<'info, TokenAccount>           │
│  token_b_vault: Account<'info, TokenAccount>           │
│  token_program: Program<'info, Token>                   │
│  token_a_mint: UncheckedAccount<'info>                 │
│  token_b_mint: UncheckedAccount<'info>                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📖 开发历程

### Week 1: 项目初始化 ✅ (2026-02-07)

#### 完成的任务

1. **项目创建**
   ```bash
   npx create-solana-dapp@latest . --template nextjs
   ```

2. **GitHub 仓库创建**
   - 私有仓库
   - SSH 认证

3. **Anchor 配置**
   - 创建 programs/amm/
   - 配置 Anchor.toml

4. **AMM 核心逻辑**
   - math.rs - AMM 数学模型
   - state.rs - AmmPool 状态
   - errors.rs - 错误定义

#### 学到的经验

- Solana 程序必须在 4096 字节帧空间内
- `init` 约束会生成大量验证代码
- 使用 `UncheckedAccount` 可以节省空间

### Week 2: AMM 完善 🔄 (进行中)

#### 已完成

- ✅ initialize 指令
- ✅ swap 指令
- ✅ add_liquidity 指令
- ✅ 构建成功

#### 待完成

- [ ] remove_liquidity 指令
- [ ] LP Token 铸造
- [ ] 单元测试

### Week 3: Lending 模块 ⏸️ (待修复)

#### 当前状态

- ⚠️ Lending 模块编译失败
- ❌ 帧空间溢出 (4928 > 4096)
- ❌ 模块导入错误

#### 待解决问题

1. 简化 Lending 账户结构
2. 修复模块导入
3. 添加清算机制

---

## ⚠️ 遇到的问题及解决方案

### 问题 1: 帧空间溢出

**错误信息**
```
Program failed to complete: exceeded the maximal program log stack size
or too large transaction: 4928 bytes
```

**原因分析**
- `init` 约束生成太多验证代码
- 结构体包含太多账户
- Anchor 0.30.1 的 IDL 生成开销

**解决方案**

```rust
// ❌ 原始代码（问题）
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, ...)]
    pub token_a_vault: Account<'info, TokenAccount>, // 占用大量空间
}

// ✅ 优化后
#[derive(Accounts)]
pub struct Initialize<'info> {
    // 移除了 vault 的 init 约束
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(init, space = 168, ...)]  // 手动指定空间
    pub amm_pool: Account<'info, AmmPool>,
    
    // 使用 UncheckedAccount 节省空间
    pub token_a_mint: UncheckedAccount<'info>,
    pub token_a_vault: UncheckedAccount<'info>,
    // ...
}
```

**学到的经验**
- 手动指定 `space = 168` 代替自动计算
- vault 创建移到客户端处理
- 使用 `UncheckedAccount` 替代 `Account`/`TokenAccount`

### 问题 2: Anchor 版本不匹配

**错误信息**
```
WARNING: `anchor-lang` version(0.30.1) and the current CLI version(0.32.1) don't match.
```

**原因分析**
- Solana CLI 4.0.0 带的 Anchor CLI 是 0.32.1
- 项目代码使用 anchor-lang 0.30.1

**解决方案**

```toml
# Anchor.toml
[toolchain]
anchor_version = "0.30.1"
```

**结果**
- 警告仍存在，但不影响功能
- 推荐使用兼容版本组合

### 问题 3: SBF 工具链不支持 edition2024

**错误信息**
```
feature `edition2024` is required
The package requires the Cargo feature called `edition2024`, but that feature is not stabilized in this version of Cargo (1.84.0).
```

**原因分析**
- Solana 3.0.14 的 SBF 工具链使用 Rust 1.84.1
- anchor-lang 0.32.1 依赖 edition2024

**解决方案**

```bash
# 使用 edge 版本的 Solana CLI
agave-install init edge
export PATH="/Users/bypasser/.local/share/solana/install/active_release/bin:$PATH"
```

**结果**
- ✅ 获取最新 SBF 工具链 (v1.53)
- ✅ 支持 Rust 1.89.0

### 问题 4: Rust 模块导入循环

**错误信息**
```
error[E0432]: unresolved import `crate`
error[E0603]: function import `initialize` is private
```

**原因分析**
- `instructions/` 目录中的文件引用冲突
- `use crate::instructions::*` 导致循环引用

**解决方案**

将所有指令合并到 `lib.rs`：
```rust
// lib.rs - 单一文件包含所有代码
pub mod state;
pub mod math;
pub mod errors;

#[program]
pub mod amm {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>, ...) -> Result<()> {
        // 直接实现
    }
}

// 所有 Accounts 结构体也在同一个文件
#[derive(Accounts)]
pub struct Initialize { ... }
```

### 问题 5: Lending 模块帧空间更大

**错误信息**
```
error: Program failed to complete: exceeded the maximal program log stack size
Frame size: 5312 bytes
```

**原因分析**
- Lending 包含更多状态账户
- 复杂的账户验证逻辑

**临时解决方案**
- 禁用 Lending 模块
- 简化账户结构后重新实现

---

## 📝 代码规范

### Rust 风格指南

```rust
// 1. 驼峰命名用于类型
pub struct AmmPool { ... }
pub enum ErrorCode { ... }

// 2. 蛇形命名用于函数和变量
pub fn initialize_pool(...) -> Result<()> {
    let pool_balance = ctx.accounts.pool.amount;
}

// 3. PascalCase 用于宏
#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Initialize { ... }

// 4. 常量大写
const FEE_DENOMINATOR: u64 = 10000;
const FEE_NUMERATOR: u64 = 30; // 0.3%
```

### 错误处理

```rust
// 使用 Anchor 的 Result 和 ErrorCode
use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Slippage exceeded")]
    SlippageExceeded = 0,
    
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity = 1,
}

// 在指令中使用
require!(amount_out >= minimum_amount_out, ErrorCode::SlippageExceeded);
```

### 溢出保护

```rust
// ❌ 危险 - 可能 panic
pool.reserve_a = pool.reserve_a + amount_a;

// ✅ 安全 - 使用 checked arithmetic
pool.reserve_a = pool.reserve_a.checked_add(amount_a).unwrap();

// ✅ 更安全 - 返回 Result
pool.reserve_a = pool.reserve_a.checked_add(amount_a)
    .ok_or(ErrorCode::Overflow)?;
```

### 账户验证

```rust
// 使用 has_one 约束
#[account(
    mut,
    seeds = [b"amm", amm_pool.seed.to_le_bytes().as_ref()],
    bump = amm_pool.bump,
    has_one = token_a_mint,
    has_one = token_b_mint,
)]
pub amm_pool: Account<'info, AmmPool>,
```

---

## 🧪 测试指南

### 运行测试

```bash
# 1. 启动本地测试网络
solana-test-validator

# 2. 运行所有测试
anchor test

# 3. 运行特定测试
anchor test --skip-build tests/amm.ts
```

### 测试示例

```typescript
// tests/amm.ts
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Amm } from '../target/types/amm';

describe('AMM', () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  
  const program = anchor.workspace.Amm as Program<Amm>;
  
  it('Initialize AMM Pool', async () => {
    // 测试初始化
  });
  
  it('Swap Tokens', async () => {
    // 测试交换
  });
});
```

### 本地测试网络命令

```bash
# 查看账户余额
solana balance <ADDRESS>

# 查看账户信息
solana account <ADDRESS>

# 获取测试代币
solana airdrop 5 <ADDRESS>

# 查看程序日志
solana logs <PROGRAM_ID>
```

---

## 🚀 部署步骤

### 部署到 Devnet

```bash
# 1. 设置集群
solana config set --url devnet

# 2. 配置钱包
solana config get keypair

# 3. 构建
anchor build

# 4. 部署
anchor deploy --provider.cluster devnet

# 5. 验证部署
solana account <PROGRAM_ID>
```

### 生产环境检查清单

- [ ] 所有测试通过
- [ ] 代码审计完成
- [ ] 安全检查通过
- [ ] 文档更新
- [ ] 备份钱包

---

## ❓ 常见问题

### Q1: 构建失败 "program ID mismatch"

**问题**
```
Error: Program ID mismatch
```

**解决**
```bash
# 更新 Anchor.toml 中的 program ID
# 或重新构建
anchor build --skip-local-validator
```

### Q2: 测试超时

**问题**
```
Timeout: Test did not complete in 120 seconds
```

**解决**
```bash
# 确保 solana-test-validator 正在运行
solana-test-validator

# 或者跳过本地验证器
anchor test --skip-local-validator
```

### Q3: 余额不足

**问题**
```
Error: insufficient funds
```

**解决**
```bash
# 获取测试代币
solana airdrop 5 <YOUR_ADDRESS>

# 检查余额
solana balance <YOUR_ADDRESS>
```

### Q4: CPI 调用失败

**问题**
```
Error: Cross program invocation failed
```

**解决**
```rust
// 检查目标程序地址
let token_program = ctx.accounts.token_program.key();

// 检查权限
require!(ctx.accounts.authority.key() == pool.authority, ErrorCode::Unauthorized);
```

### Q5: 帧空间不足

**问题**
```
Error: exceeded the maximal program log stack size
```

**解决**
1. 简化账户结构
2. 使用 `UncheckedAccount`
3. 移除不必要的验证
4. 手动指定 `space`

---

## 📋 项目规划 (2026-02-07)

### 当前状态

| 模块 | 状态 | 说明 |
|------|------|------|
| AMM initialize | ✅ 完成 | 池初始化 |
| AMM swap | ⚠️ 待修复 | 需要更新 reserves |
| AMM add_liquidity | ⚠️ 待完善 | 缺少 LP Token 铸造 |
| AMM remove_liquidity | 🔲 待实现 | |
| LP Token | 🔲 待实现 | SPL Token Mint |
| Lending | 🔲 待修复 | 帧空间溢出 5312 > 4096 |
| 单元测试 | 🔲 待编写 | |

### AMM 代码问题清单

| 位置 | 问题 | 优先级 |
|------|------|--------|
| `swap` 指令 | 只做了 token transfer，没更新 reserves | P0 |
| `add_liquidity` | 没实现 LP Token 铸造逻辑 | P1 |
| `remove_liquidity` | 还没实现 | P2 |

### 后续开发计划

#### Phase 1: AMM 完善
1. **修复 swap 指令** - 更新 reserves + 验证 vault 余额
2. **实现 LP Token** - Mint/Burn LP Token
3. **实现 remove_liquidity** - 提取流动性 + burn LP
4. **编写单元测试**

#### Phase 2: Lending 修复
1. **简化账户结构** - 解决帧空间溢出
2. **修复模块导入** - 循环引用问题
3. **实现核心功能** - Deposit/Borrow/Repay
4. **添加清算机制**

---

## 📋 未来待办

### 短期 (Week 2)

- [ ] 实现 Remove Liquidity 指令
- [ ] 实现 LP Token 铸造
- [ ] 编写 AMM 单元测试
- [ ] 修复 Lending 模块

### 中期 (Week 3-4)

- [ ] 借贷核心功能
- [ ] 清算机制
- [ ] Next.js 前端开发
- [ ] 集成测试

### 长期

- [ ] 安全性审计
- [ ] 性能优化
- [ ] 主网上线
- [ ] 社区治理

---

## 📚 参考资料

### Solana 官方

- [Solana Docs](https://docs.solana.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Program Library](https://spl.solana.com/)
- [Solana GitHub](https://github.com/solana-labs)

### Anchor Framework

- [Anchor Docs](https://www.anchor-lang.com/)
- [Anchor GitHub](https://github.com/coral-xyz/anchor)
- [Anchor Examples](https://github.com/coral-xyz/anchor-examples)
- [Anchor Lang API](https://docs.rs/anchor-lang/latest/anchor_lang/)

### DeFi 协议

- [Uniswap V2 Whitepaper](https://uniswap.org/whitepaper.pdf)
- [Uniswap V3](https://uniswap.org/blog/uniswap-v3/)
- [Aave Protocol](https://aave.com/)
- [Compound Finance](https://compound.finance/)

### 学习资源

- [Patrick Collins Foundry Course](https://github.com/Cyfrin/foundry-full-course-cu)
- [SolDev Bootcamp](https://www.soldev.co/)
- [Solana Playground](https://beta.solpg.io/)

### 工具

- [Solana Explorer](https://explorer.solana.com/)
- [Solscan](https://solscan.io/)
- [QuickNode](https://www.quicknode.com/) - RPC 服务
- [Helius](https://www.helius.dev/) - RPC 服务

---

## 📊 提交历史（按功能模块）

### AMM 模块提交记录

| 提交 | 描述 |
|------|------|
| [`27ac2fb`](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending/commit/27ac2fb) | feat: complete AMM module implementation - Fix swap reserves, add LP Token, remove_liquidity |
| [`8395aca`](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending/commit/8395aca) | feat: implement simplified Lending module |
| [`7adef41`](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending/commit/7adef41) | docs: update DEVELOPMENT.md with module-wise commit history |
| [`78667f3`](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending/commit/78667f3) | chore: update environment to Anchor 0.32.1 + Solana 4.0.0 |
| [`c5e8925`](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending/commit/c5e8925) | docs: 更新 README 添加文档链接 |
| [`8f7db57`](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending/commit/8f7db57) | docs: 添加完整开发指南 DEVELOPMENT.md |
| [`c6e4d7c`](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending/commit/c6e4d7c) | feat: AMM 模块构建成功 |
| [`4b30063`](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending/commit/4b30063) | feat: 清理临时文件 |
| [`5245b16`](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending/commit/5245b16) | feat: 初始化项目结构 - AMM + Lending DeFi Protocol |

### 最新 Program IDs (Devnet)

| 模块 | Program ID | 说明 |
|------|-----------|------|
| AMM | `CZaKkKoLPHzcRXtm5q5X8YQNpr15ocASwgvW6krjFZex` | 已部署 |
| Lending | `8oCbnRgZnWRd1ctY3otZvwGqJpr8fG7b2atYFxqUAjxC` | 已部署 |

### Git 分支策略

```
main (生产就绪)
├── feature/amm          → 已合并 ⌘
└── feature/lending     → 已合并 ⌘
```

---

## 🏆 毕业要求

### 毕业条件 (满足其一)

1. ✅ 完成 Task 1-6 中任意 4 个
2. ⏳ 完成毕业设计并提交黑客松
3. [ ] 参加 Solana 华语 Vibe Coding 黑客松

### 当前进度

| 要求 | 状态 |
|------|------|
| Task 1-6 完成 | ✅ 已完成 |
| AMM 模块 | ✅ 已完成 |
| Lending 模块 | ✅ 已完成（简化版） |
| 毕业设计 | 🔄 就绪 |
| 黑客松提交 | ⏳ 待提交 |

---

## 📝 更新日志

### 2026-02-07 版本更新

**代码优化：**
- ✅ Anchor 0.30.1 → **0.32.1**
- ✅ Solana SDK 1.18.0 → **4.0.0**
- ✅ 统一 macOS 和服务器环境

**环境验证：**
- ✅ Rust 1.95.0-nightly (统一)
- ✅ Solana CLI 4.0.0 Agave (统一)
- ✅ Anchor 0.32.1 (统一)
- ✅ **Lending 模块已完成**（简化版，无清算）

### 2026-02-07

- ✅ 初始化项目
- ✅ AMM 核心模块
- ✅ 成功构建
- ⚠️ Lending 模块禁用

---

## 👤 作者

**truongvknnlthao-gif**

- GitHub: [@truongvknnlthao-gif](https://github.com/truongvknnlthao-gif)
- 项目: [solana-defi-amm-lending](https://github.com/truongvknnlthao-gif/solana-defi-amm-lending)

---

## 📄 License

MIT

---

## 🙏 致谢

- Solana Foundation
- Solana Bootcamp 导师
- OpenBuild 社区
