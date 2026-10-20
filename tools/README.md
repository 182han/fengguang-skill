# tools · 复现脚本

升级 skill 时用这三个脚本重跑统计，把新数据回填 `references/风格指纹.md`。

## 依赖

- Python 3 + `Pillow` + `numpy`（`analyze_*.py`）
- Node.js 24+（`bilibili_sprite.js`，仅用内置 `https`，零依赖）

## 用法

### 1. 静帧 → 指标

```bash
python tools/analyze_stills.py "C:\path\to\照片目录" refs_stats.json
```

自动定位每张图的画面带（行内方差 > 14 的最长连续段），输出每张的
`lum / dark_ratio / highlight_ratio / sat / warm / cool / ar` 与汇总。

### 2. B 站长片 → 抽帧

```bash
node tools/bilibili_sprite.js BV1k9H761ERK BV1ZcaDziE5R --out ./_sprites
```

只调只读接口，不下载完整视频：

- `/x/web-interface/view` 取标题、时长、封面、cid
- `/x/player/videoshot?index=1` 取 10×10 帧网格 jpg

### 3. 帧 → 指标

```bash
python tools/analyze_frames.py ./_sprites --prefix BV1k9H761ERK
```

自动跳过纯黑占位格（`lum < 12`），输出与静帧同一套指标，可直接对比。

## 指标口径

| 指标 | 定义 |
|---|---|
| `lum` | `0.2126R + 0.7152G + 0.0722B` 的均值 |
| `dark` / `dark_ratio` | 亮度 < 40 的像素占比 |
| `hl` / `highlight_ratio` | 亮度 > 200 的像素占比 |
| `sat` | `(max−min)/max` 均值（HSV 式饱和度） |
| `warm` | `R > B+15 且 R > G+10` 的占比 |
| `cool` | `B > R+15` 的占比 |

## 注意

- 这些脚本**只做测量**，不下载完整视频、不绕过任何鉴权。
- `analyze_frames.py` 假设 sprite 是 10×10 网格；若平台改动，改 `GRID` 常量。
- 静帧若是全黑或大面积同一色，行方差法可能定位失败，会被计入 `skipped`。
