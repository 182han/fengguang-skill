# skill-fengguang · 摄影级自然风光视频提示词

一个**数据驱动**的 AI agent skill：把一句人话，写成能生成「摄影级」自然风光视频的中文提示词。

不是"形容词大全"，而是从**真实作品**里量出来的参数。

## 为什么是数据驱动

我们统计了两类真实素材：

| 素材 | 量 | 说明 |
|---|---|---|
| 自然风光静帧 | 80 张 | 摄影比赛/图库级 |
| 4K/8K 风光长片 | 5 部，**2210 帧** | Scenic Relaxation 式屏保长片 + 国家地理纪录片 + 天文摄影 |

量出来的关键事实（完整数据见 `references/风格指纹.md`）：

- 专业风光片平均亮度稳定在 **104–105**，暗部 **9–16%**
- **高光中位数只有 0.2%–3.4%** —— "高光控死"才是摄影级最硬的标志
- 静帧比长片**更浓更暖**（饱和 0.405 vs 0.339，暖色 27.5% vs 15.1%）→ 因此分 `dramatic` / `cinematic-calm` 两档
- 不同题材色板差异极大：国家地理式 sat 0.237（极冷极淡）、秋色 sat 0.394（暖浓）、天文 sat 0.295 + 暖主导 86%（暗底暖星云）

## 里面有什么

```
SKILL.md              主规程：判据、两档风格、七段骨架、构图五条、自检卡
references/词库.md    50 条「日常词 → 地貌专名」对照表 + 光线/运镜/材质/负面词
references/风格指纹.md 全部实测数据、分片色板、复现方法、已知局限
examples/样例.md      5 条完整范例 + 1 组反例改法 + 批量差异化技巧
CHANGELOG.md          版本记录
```

## 怎么用

### 作为 agent skill

一条命令装好（目录名即 skill 名，`SKILL.md` 必须在根）：

```powershell
# Windows
.\install.ps1                                  # 默认装到 ~\.dsh\skills\fengguang
.\install.ps1 -Target "$env:USERPROFILE\.claude\skills"
```

```bash
# macOS / Linux
./install.sh                                   # 默认装到 ~/.dsh/skills/fengguang
./install.sh ~/.claude/skills
```

不同工具的 skills 路径不同：

```
~/.dsh/skills/fengguang/     # DeepSeek Harness
~/.claude/skills/fengguang/  # Claude Code 类
```

装完用 `风光提示词 / 摄影级大片 / 雪山 / 银河 / 极光 / 沙丘 / 屏保长片` 触发。

### 当作文档直接读

不装也能用：直接读 `SKILL.md`，要查词就翻 `references/词库.md`。

### 最小用法（30 秒）

1. 说人话："我想拍沙漠日落"
2. 查 `词库.md §1` → 沙丘脊线 / 风纹 / 滑落面
3. 选一档：`dramatic` 还是 `cinematic-calm`
4. 套七段公式（`SKILL.md §四`）
5. 过 10 条自检卡（`SKILL.md §十二`）

## 设计原则

- **用户说人话**：绝不要求用户懂地质术语，翻译由 skill 负责。
- **一条提示词只有一条运动主轴**：双运镜是画面抖动的第一原因。
- **参数可回填**：所有色板都是数字，跑完真实成片后可以校准。
- **不承诺模型能力之外的事**：水印、字幕、转场不在提示词里写。

## 已知局限

- 1x.com 的图片未取得像素（JS 渲染 + 本机无头浏览器不可用），其视觉语法依据策展结构与极简样本推断。
- 静帧为手机截屏，画面带定位依赖行方差阈值，极少数全黑构图可能误判。
- `warm/cool` 是粗粒度色相判据，不能替代专业色彩分析。
- 本 skill 产出的提示词**未经大规模生成验证**；`CHANGELOG.md` 会记录每次验证的结果。

## 升级路线

| 版本 | 目标 |
|---|---|
| v0.1 | 文档版（当前）：规程 + 词库 + 数据 |
| v0.2 | 用真实成片回填色板参数，修正偏差 |
| v0.3 | 词库回填到生成流水线的模板池（解决短池重复运镜） |
| v1.0 | 接入 AI 优化链路，自动产出提示词 |

## 数据出处

- 中国国家地理网 `dili360.com`：地貌叙事与专有地貌分类
- 1x `1x.com`：策展制（获奖 / 已发布 / 展览三级）
- B 站 5 部 4K/8K 风光长片（快照接口抽帧，未下载完整视频）
- 用户提供的 80 张风光静帧

## 许可证

**MIT**，见 [`LICENSE`](LICENSE)。

数据部分（`references/风格指纹.md`）的统计结论可自由引用，但原始素材版权归各摄影师与平台所有，未随本仓库分发。

---

# English

## skill-fengguang · Photographic Landscape Video Prompts

A **data-driven** agent skill that turns one plain sentence into a Chinese prompt for
photoreal-grade landscape video generation. Not a list of adjectives — parameters measured
from real work.

### Why data-driven

Two corpora were measured:

| Corpus | Size | Notes |
|---|---|---|
| Landscape stills | 80 images | contest / gallery grade |
| 4K–8K landscape films | 5 films, **2,210 frames** | Scenic-Relaxation-style screensaver films, a NatGeo documentary, astrophotography |

Measured facts (full data in `references/风格指纹.md`):

- Professional landscape video sits at mean luminance **104–105**, shadows **9–16%**
- **Median highlight coverage is only 0.2%–3.4%** — "clamped highlights" is the hardest
  signature of photographic grade, harder than any adjective
- Stills are more saturated and warmer than film frames (sat 0.405 vs 0.339, warm 27.5% vs 15.1%)
  → hence two profile tiers: `dramatic` / `cinematic-calm`
- Palettes differ sharply by subject: NatGeo-style sat 0.237 (very cold & pale), autumn sat 0.394
  (warm & rich), astro sat 0.295 with 86% warm-dominant frames (dark base, luminous warm nebula)

### What is inside

```
SKILL.md              the playbook: criteria, two tiers, 7-slot formula, composition, checklist
references/词库.md     50-entry "plain words → geomorphological term" table + light/move/texture/negative vocab
references/风格指纹.md  all measurements, per-film palettes, reproduction method, limitations
examples/样例.md       5 full examples + a bad→good rewrite + batch-variation tips
tools/                zero-dependency scripts to reproduce every number
```

### Install

Drop the directory into your agent's skills folder, e.g.:

```
~/.dsh/skills/fengguang/     # DeepSeek Harness
~/.claude/skills/fengguang/  # Claude-Code-like agents
```

`SKILL.md` must sit at the directory root; the trigger phrases live in its YAML `description`.

### Design principles

- **The user speaks plainly** — never require geological jargon; the skill translates.
- **One motion axis per prompt** — dual camera moves are the top cause of jitter.
- **Every parameter is a number** — palettes can be recalibrated after real renders.
- **No promises beyond the model** — watermarks, subtitles, transitions are pipeline concerns.

### Roadmap

| Version | Goal |
|---|---|
| v0.1 | Document edition (current): playbook + vocabulary + measurements |
| v0.2 | Recalibrate palettes from real renders |
| v0.3 | Feed the vocabulary back into the generation pipeline's template pools |
| v1.0 | Wire the skill into the AI prompt-optimisation path |

### Limitations

- 1x.com images could not be fetched pixel-wise (JS-rendered; no headless browser available
  on the build machine). Its visual grammar is inferred from curation structure and minimal samples.
- Stills are phone screenshots; band detection relies on a row-variance threshold.
- `warm/cool` is a coarse hue proxy, not a substitute for proper colour analysis.
- The prompts produced have **not** been validated at scale by real generation.

### License

MIT — see [`LICENSE`](LICENSE).
