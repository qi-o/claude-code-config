# GLM Skills 工作流集成

## 环境要求

所有 GLM 技能共享 `ZHIPU_API_KEY` 环境变量（已在 settings.json 配置）。
脚本位于 `~/skills/<skill-name>/scripts/`。

## 多模态理解（glmv-caption）

**触发**：用户发送图片/视频要求分析内容，或需要理解论文图表的视觉信息
**脚本**：`python ~/skills/glmv-caption/scripts/glmv_caption.py`
**协作**：与 ai4scholar 互补 — ai4scholar 提取文本，glmv-caption 提取视觉信息（图表、示意图、实验照片）
**科研场景**：Western blot 解读、实验结果截图分析、显微镜图片描述、论文图表理解

## 文档解析（glmocr-sdk）

**触发**：需要快速轻量解析论文结构（标题/表格/公式区域定位）时
**安装**：`pip install glmocr`（已安装）
**Python API**：`import glmocr; result = glmocr.parse("paper.pdf")`
**CLI**：`glmocr parse paper.pdf --stdout`
**协作**：作为 MinerU 的轻量备选 — 无需 Java 环境，pip install 即用
**输出**：`result.markdown_result`（全文 Markdown）+ `result.json_result`（按页按区域的结构化 JSON）

## 视觉定位（glmv-grounding）

**触发**：医学影像标注、细胞图片定位、组织切片 ROI 标注时
**脚本**：`python ~/skills/glmv-grounding/scripts/glm_grounding_cli.py`
**坐标**：归一化 0-1000，格式 `[x1, y1, x2, y2]`
**输出**：边界框坐标 + 可视化图片（`--visualize`）
**依赖**：Pillow, opencv-python, numpy, matplotlib, decord

## 论文转演示（glmv-pdf-to-ppt）

**触发**：需要将论文转为组会汇报演示文稿时
**脚本目录**：`~/skills/glmv-pdf-to-ppt/scripts/`
  - `pdf_to_images.py` — PDF 转图片
  - `crop.py` — 图片裁剪（千分位坐标）
  - `generate_slide.py` — 生成 HTML 幻灯片
**输出**：`ppt/<pdf_stem>_<timestamp>/` 目录，含 outline.json + slide_*.html + summary.md
**依赖**：pymupdf, Pillow

## 工作流衔接

```
文献搜索（ai4scholar）
    ↓
论文 PDF 获取
    ↓
├─ 文本提取 → ai4scholar read / MinerU / glmocr-sdk
├─ 图表理解 → glmv-caption（多模态视觉分析）
├─ 图像标注 → glmv-grounding（目标定位）
└─ 组会汇报 → glmv-pdf-to-ppt（论文转演示）
    ↓
写作输出 → academic-writing-suite
```
