# IELTS Computer-Delivered Mock Test Simulator

这是一个 IELTS Computer-Delivered Mock Test Simulator。当前项目已经从 V1 的纯前端模拟器，开始升级到 V2 的 Frontend + Backend + PostgreSQL 架构。

V2 的核心原则：

```text
Backend should replace infrastructure responsibilities, not replace the working Exam Engine.
```

也就是说，Reading、Listening、Writing 的考试界面和交互优先复用 V1，后端逐步接管试卷库、导入、考试记录、保存、判分、结果和复习数据。

## 当前状态

已完成：

- V1 React Exam Engine 保留。
- Test Library 可以展示多套 published mock tests。
- 已接入 `Mock Test 01`、`Mock Test 02`、`Mock Test 03`、`Mock Test 04`。
- Test 2-4 的 PDF 页面已渲染为图片资产，用于保留原始 IELTS 题面。
- Test 2-4 的 Listening 音频已按文件名接入，不解析音频内容。
- Reading / Listening 仍支持本地 deterministic grading。
- Writing 不做 AI scoring，只保存文本并统计字数。
- 新增 V2 FastAPI backend 骨架。
- 新增 PostgreSQL / SQLAlchemy / Alembic schema。
- 新增公开 Test API、Admin Test API、Attempt API 的主干。
- 新增简单 Test Management 页面入口。
- 前端 API client 已添加，支持后端优先、本地回退。

当前限制：

- Test 1 是手工结构化题面。
- Test 2-4 当前是 `source-page backed` seed：原始题面通过 PDF 页面图片展示，右侧提供结构化答题框和答案键。
- Test 2-4 还没有逐题精修成完整的 radio、matching、table-completion 等复杂控件。
- 前端考试过程仍主要使用本地 Zustand + LocalStorage，后端 attempt API 已有，但还没有完全接入自动保存。

## 技术栈

Frontend：

- React
- TypeScript
- Vite
- React Router
- CSS Modules
- Zustand
- pnpm

Backend：

- Python
- FastAPI
- Pydantic
- SQLAlchemy 2.x
- Alembic
- PostgreSQL

Assets：

- V2 初期使用本地 filesystem storage。
- 前端通过 asset path / future asset URL 使用资源。
- 后端已预留 Asset Service / Asset model 的抽象空间，未来可以替换为 S3、Cloudflare R2、OSS 或 COS。

## V1 当前结构

主要目录：

```text
src/app/
src/components/
src/data/cambridge4/
src/domain/
src/pages/
src/pages/admin/
src/pages/exam/
src/pages/library/
src/pages/results/
src/services/
src/store/
public/assets/
```

关键职责：

- `src/data/cambridge4/mockTest01.ts`：V1 内置 Mock Test 01 数据。
- `src/data/cambridge4/mockTest02.ts`：Cambridge IELTS 4 Test 2 seed 数据。
- `src/data/cambridge4/mockTest03.ts`：Cambridge IELTS 4 Test 3 seed 数据。
- `src/data/cambridge4/mockTest04.ts`：Cambridge IELTS 4 Test 4 seed 数据。
- `src/data/cambridge4/mockTestFactory.ts`：source-page-backed 试卷数据工厂。
- `src/domain/examTypes.ts`：考试核心类型。
- `src/domain/grading.ts`：Reading / Listening deterministic grading。
- `src/domain/bandConversion.ts`：raw score 到 band score 的换算。
- `src/domain/sessionFactory.ts`：创建初始考试 session。
- `src/services/testRepository.ts`：试卷数据读取边界。
- `src/services/sessionRepository.ts`：本地考试状态保存边界。
- `src/store/examStore.ts`：Zustand 考试状态。
- `src/pages/library/`：总试卷库和单套卷模块选择页。
- `src/pages/exam/`：考前说明页、Reading / Listening 客观题页面、Writing 页面。
- `src/pages/results/`：单模块结果、Review、Final Result 页面。
- `src/pages/admin/`：Test Management 页面。

## V1 可直接复用的部分

这些部分应该继续保留，不要为了加 backend 重写：

- Reading split-screen layout
- Listening restricted audio player
- Writing editor
- Timer display
- Question navigator
- Highlight / note system
- Review Mode UI
- Result / Final Result 页面
- Objective grading 的规则逻辑
- MockTest domain schema 的核心形状

## V2 Backend Directory Structure

当前后端结构：

```text
backend/
  app/
    api/
      admin_tests.py
      attempts.py
      tests.py
      errors.py
    core/
      config.py
    db/
      base.py
      session.py
    models/
      entities.py
    schemas/
      attempt_schema.py
      test_schema.py
    services/
      grading.py
      test_import.py
    main.py
  alembic/
    versions/
      20260831_0001_initial_v2_schema.py
  alembic.ini
  requirements.txt
  .env.example
```

## Database Schema

当前 Alembic migration 建立了这些核心表：

- `mock_tests`
- `assets`
- `exam_attempts`
- `exam_answers`
- `writing_responses`
- `exam_results`
- `highlights`

设计重点：

- `mock_tests.content` 使用 PostgreSQL `JSONB` 保存可移植 MockTest schema。
- `exam_attempts.test_version` 锁定用户开始考试时的 test version。
- `answer_keys` 暂时保留在 `mock_tests.content` 内，Exam Mode API 会剥离答案。
- `assets` 独立保存资源 metadata 和 storage key。
- `exam_results.payload` 保存结构化判分结果，便于 Review API 返回。

## API Structure

已添加的公开接口：

```text
GET  /health
GET  /api/tests
GET  /api/tests/{test_id}
```

已添加的 Admin 接口：

```text
GET    /api/admin/tests
POST   /api/admin/tests/import
POST   /api/admin/tests/{test_id}/publish
POST   /api/admin/tests/{test_id}/archive
DELETE /api/admin/tests/{test_id}
POST   /api/admin/tests/{test_id}/assets
```

已添加的 Attempt 接口：

```text
POST /api/attempts
GET  /api/attempts/{attempt_id}
PUT  /api/attempts/{attempt_id}/answers/{question_id}
PUT  /api/attempts/{attempt_id}/writing/{task_number}
POST /api/attempts/{attempt_id}/submit
GET  /api/attempts/{attempt_id}/result
GET  /api/attempts/{attempt_id}/review
POST /api/attempts/{attempt_id}/highlights
DELETE /api/attempts/{attempt_id}/highlights/{highlight_id}
```

Admin API 使用请求头：

```text
X-Admin-Token
```

## 本地运行

安装前端依赖：

```bash
pnpm install
```

启动前端：

```bash
pnpm dev
```

前端默认地址通常是：

```text
http://localhost:5173/
```

安装后端依赖：

```bash
cd backend
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

准备后端环境变量：

```bash
cp .env.example .env
```

启动后端：

```bash
cd backend
.venv/bin/uvicorn app.main:app --reload
```

后端默认地址：

```text
http://localhost:8000/
```

前端连接后端时，在项目根目录配置：

```text
VITE_API_BASE_URL=http://localhost:8000
VITE_ADMIN_TOKEN=change-me-for-local-development
```

如果没有配置 `VITE_API_BASE_URL`，前端会继续使用本地内置试卷数据。

## GitHub Pages Deployment

这个仓库包含 `backend/`，但 GitHub Pages 只能托管静态前端文件，不能运行 FastAPI 或 PostgreSQL。

当前项目可以部署一个静态前端版到 GitHub Pages。前端会使用本地内置 mock test 数据；需要后端数据库能力时，后端要单独部署到支持 Python/PostgreSQL 的平台。

已配置：

- Vite GitHub Pages base path：`/ielts-simulator/`
- React Router basename：使用 `import.meta.env.BASE_URL`
- `gh-pages` 部署依赖
- `predeploy`：构建 GitHub Pages 版本，并生成 `404.html` 支持前端路由刷新
- `deploy`：发布 `dist/` 到 `gh-pages` 分支

部署命令：

```bash
pnpm deploy
```

GitHub Pages 网页端设置：

1. 打开 GitHub 仓库 `Lynnnnn-n/ielts-simulator`。
2. 进入 `Settings`。
3. 打开 `Pages`。
4. `Build and deployment` 选择 `Deploy from a branch`。
5. Branch 选择 `gh-pages`。
6. Folder 选择 `/ (root)`。
7. 保存后等待 GitHub Pages 构建完成。

最终访问地址格式：

```text
https://lynnnnn-n.github.io/ielts-simulator/
```

## Database Setup

V2 使用 PostgreSQL。创建数据库后运行：

```bash
cd backend
.venv/bin/alembic upgrade head
```

默认连接示例：

```text
postgresql+psycopg://ielts:ielts@localhost:5432/ielts_simulator
```

不要把真实密码、API key 或 production secret 提交进 Git。

## Mock Test Assets

当前资源目录：

```text
public/assets/mock-test-01/
public/assets/mock-test-02/
public/assets/mock-test-03/
public/assets/mock-test-04/
```

Test 2-4 的音频文件：

```text
public/assets/mock-test-02/audio/test2_section1.mp3
public/assets/mock-test-02/audio/test2_section2.mp3
public/assets/mock-test-02/audio/test2_section3.mp3
public/assets/mock-test-02/audio/test2_section4.mp3
public/assets/mock-test-03/audio/test3_section1.mp3
public/assets/mock-test-03/audio/test3_section2.mp3
public/assets/mock-test-03/audio/test3_section3.mp3
public/assets/mock-test-03/audio/test3_section4.mp3
public/assets/mock-test-04/audio/test4_section1.mp3
public/assets/mock-test-04/audio/test4_section2.mp3
public/assets/mock-test-04/audio/test4_section3.mp3
public/assets/mock-test-04/audio/test4_section4.mp3
```

Test 2-4 的 PDF 页面图片：

```text
public/assets/mock-test-02/pages/
public/assets/mock-test-03/pages/
public/assets/mock-test-04/pages/
```

## Verification

已运行并通过：

```bash
pnpm typecheck
pnpm build
backend/.venv/bin/python -m compileall backend/app
backend/.venv/bin/python -c "import sys; sys.path.insert(0, 'backend'); from app.main import app; print(app.title); print(len(app.routes))"
```

后端 app 当前可以加载，路由数量为 22。

## Potential Migration Risks

- Test 2-4 使用 PDF 页面图片作为题面，交互控件暂时不是完全 IELTS 原版题型控件。
- PDF OCR 文本存在识别误差，尤其是答案页个别字母和罗马数字需要人工复核。
- 当前本地 grading 对 “in either order” 的多选题采用多个题号接受同一组答案的兼容处理，后续应增加 multi-answer group grading。
- 当前 word limit / number limit 还没有在后端 grading 中完整强制执行。
- Frontend 还没有把 active attempt、autosave、server timer 完全切到 backend。
- Published test version locking 的 schema 已有，但前端还没使用 backend attempt flow。
- Asset upload endpoint 当前只做文件类型 validation stub，真实 storage write 会在下一步补齐。

## Future Work

优先级较高：

1. Seed Import：把 Mock Test 01-04 从 frontend seed 导入 PostgreSQL。
2. Frontend Attempt Flow：开始模块时调用 `POST /api/attempts`。
3. Autosave：答案、Writing、Highlights 通过 debounce 保存到 backend。
4. Refresh Recovery：刷新时用 attemptId 从 backend restore，而不是重置 timer。
5. Backend Result：提交后从 `/api/attempts/{attempt_id}/result` 获取结果。
6. Backend Review：复习页从 `/api/attempts/{attempt_id}/review` 获取正确答案。
7. Asset Upload：完成真实文件保存、filename sanitize、path traversal 防护。
8. Import Preview：导入 draft 后用现有 Exam Engine 做 admin preview。
9. Test Publish Guard：published test 如果已有 attempts，关键内容修改必须创建新 version。
10. Word / Number Limit Grading：后端完整校验 IELTS answer constraints。

可后续增强：

- 把 Test 2-4 的 source-page backed questions 精修为完整结构化题面。
- 支持 table-completion 中的 `{{q12}}` blank placement。
- 支持 section / passage / question group 级别的更精细 preview。
- 支持 admin metadata edit UI。
- 支持 draft delete 前确认和错误展示。
- 支持 local filesystem Asset Service 的完整实现。
- 支持 OpenAPI 生成 TypeScript API types。

V2 不做：

- automatic PDF parsing pipeline
- OCR service
- LLM extraction API
- AI Writing grading
- Speaking
- OAuth / complex RBAC
- Redis / Kafka / Celery
- GraphQL
- cloud object storage
