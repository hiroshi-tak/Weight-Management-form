# 体重管理

## 概要
日々の体重データを登録・管理できるほか、月別平均体重の可視化や目標体重の管理、AIによる体重推移の分析機能を提供します。

- JWT認証によるログイン機能
- 体重・体脂肪率の記録
- 体重記録の一覧表示
- 月別平均体重の集計
- グラフによる体重推移の可視化
- 身長・目標体重の管理
- Gemini APIを利用した体重推移のAI分析
- Swagger(OpenAPI)によるAPIドキュメント

## 環境構築
1. git clone git@github.com:hiroshi-tak/Weight-Management-form.git
2. cp .env.example .env.dev
   * GEMINI_API_KEYを設定
3. docker compose up --build 
4. docker compose exec backend python manage.py migrate
5. docker compose exec backend python manage.py create_users
6. docker compose exec backend python manage.py create_height_dummy
7. docker compose exec backend python manage.py create_weight_dummy

## CI/CD
GitHub Actionsを使用し、以下を自動実行しています。

- backend: Djangoテスト（manage.py test）
- frontend: lint（ESLint）

## Load Test (k6)
ローカル環境でk6を用いてAPI負荷テストを実施しました。
(tests/load/diary.js)

### 実施条件
- VUs: 50
- 対象: ログイン / 体重登録API / 取得API
- 実行環境: ローカル Docker 環境

### 結果サマリー

| 指標 | 値 |
|------|----|
| 成功率 | 100% |
| エラー率 | 0% |
| リクエスト数 | 1587 |
| 平均応答時間 | 520ms |
| p95応答時間 | 1.27s |
| 最大応答時間 | 1.81s |

### 評価

- エラー率0%のため安定稼働
- 平均520msで許容範囲内
- p95が1.27sのためピーク時はやや遅延あり
- 50VUsでは問題なく処理可能

## ユーザー登録
* ユーザー名：test1
* パスワード：12345678

## DBリセット
1. docker compose down -v
2. docker compose up --build

## 使用技術

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts

### Backend

- Django
- Django REST Framework
- Simple JWT

### Database

- PostgreSQL

### Infrastructure

- Docker
- Docker Compose

### External Service

- Google Gemini API

## システム構成図
```mermaid
flowchart LR

    User[User]

    subgraph Frontend
        NextJS[Next.js]
    end

    subgraph Backend
        Django[Django REST Framework]
    end

    subgraph Database
        PostgreSQL[(PostgreSQL)]
    end

    subgraph External
        Gemini[Google Gemini API]
    end

    User --> NextJS
    NextJS --> Django
    Django --> PostgreSQL
    Django --> Gemini
```

## ER図
```mermaid
erDiagram

    User ||--o{ Diary : records
    User ||--o{ HeightMonthly : manages

    User {
        int id PK
        string username
        string email
        datetime date_joined
    }

    Diary {
        uuid id PK
        int user_id FK
        decimal weight
        decimal body_fat
        string memo
        date record_date
        datetime created_at
        datetime updated_at
    }

    HeightMonthly {
        uuid id PK
        int user_id FK
        int year
        int month
        decimal height_cm
        decimal target_weight
    }
```

## シーケンス図

### ログイン(JWT認証)
```mermaid
sequenceDiagram

    actor User
    participant Frontend as Next.js
    participant Backend as Django API

    User->>Frontend: ユーザー名・パスワード入力

    Frontend->>Backend: POST /api/token/

    Backend->>Backend: 認証処理

    Backend-->>Frontend: access token

    Frontend->>Frontend: localStorage保存

    Frontend-->>User: ログイン成功
```

### 体重登録
```mermaid
sequenceDiagram

    actor User
    participant Frontend as Next.js
    participant Backend as Django API
    participant DB as PostgreSQL

    User->>Frontend: 体重入力

    Frontend->>Backend: POST /api/diary/
    Note over Frontend,Backend: Authorization: Bearer JWT

    Backend->>Backend: JWT認証

    Backend->>DB: INSERT Diary

    DB-->>Backend: 登録完了

    Backend-->>Frontend: 201 Created

    Frontend-->>User: 登録成功
```

### 体重取得
```mermaid
sequenceDiagram

    actor User
    participant Frontend as Next.js
    participant Backend as Django API
    participant DB as PostgreSQL

    User->>Frontend: 体重管理画面表示

    Frontend->>Backend: GET /api/diary/?year=2026&month=6
    Note over Frontend,Backend: Authorization: Bearer JWT

    Backend->>Backend: JWT認証

    Backend->>DB: Diary検索(user, month)

    DB-->>Backend: 体重一覧データ

    Backend-->>Frontend: JSONレスポンス

    Frontend-->>User: 一覧表示
```

### AI分析
```mermaid
sequenceDiagram

    actor User
    participant Frontend as Next.js
    participant Backend as Django API
    participant DB as PostgreSQL
    participant Gemini as Google Gemini API

    User->>Frontend: AI分析実行

    Frontend->>Backend: POST /api/ai-analysis/
    Note over Frontend,Backend: Authorization: Bearer JWT

    Backend->>Backend: JWT認証

    Backend->>DB: 体重履歴取得

    DB-->>Backend: 体重データ

    Backend->>Gemini: 分析依頼

    Gemini-->>Backend: 分析結果

    Backend-->>Frontend: 分析結果

    Frontend-->>User: 分析表示
```

### 月別平均体重
```mermaid
sequenceDiagram

    actor User
    participant Frontend as Next.js
    participant Backend as Django API
    participant DB as PostgreSQL

    User->>Frontend: グラフ画面表示

    Frontend->>Backend: GET /api/diary/monthly-averages/?year=2026
    Note over Frontend,Backend: Authorization: Bearer JWT

    Backend->>Backend: JWT認証

    loop 1月～12月
        Backend->>DB: AVG(weight)取得(month=n)
        DB-->>Backend: 月平均体重
    end

    Backend->>Backend: 月別データ作成

    Backend-->>Frontend: JSONレスポンス

    Frontend-->>User: グラフ表示
```
###

## API仕様

### Login

JWTアクセストークンを取得します。

| Method | Endpoint |
|----------|----------|
| POST | `/api/token/` |

#### Request

```json
{
  "username": "testuser",
  "password": "password"
}
```

#### Response

```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

---

### Refresh Token

| Method | Endpoint |
|----------|----------|
| POST | `/api/token/refresh/` |

#### Request

```json
{
  "refresh": "jwt_refresh_token"
}
```

#### Response

```json
{
  "access": "new_access_token"
}
```

---

### Current User

| Method | Endpoint |
|----------|----------|
| GET | `/api/me/` |

#### Header

```http
Authorization: Bearer {access_token}
```

---

## Weight Records

### Get Records

体重記録一覧を取得します。

| Method | Endpoint |
|----------|----------|
| GET | `/api/diary/` |

#### Query Parameters

| Parameter | Description |
|------------|-------------|
| year | 年で絞り込み |
| month | 月で絞り込み |

#### Example

```http
GET /api/diary/?year=2026&month=6
```

#### Response

```json
[
  {
    "id": "72ba310c-eaf5-4257-b4b4-c25600a38b59",
    "weight": "65.3",
    "body_fat": "18.5",
    "memo": "ランニング",
    "record_date": "2026-06-05"
  }
]
```

---

### Create Record

| Method | Endpoint |
|----------|----------|
| POST | `/api/diary/` |

#### Request

```json
{
  "weight": "65.3",
  "body_fat": "18.5",
  "memo": "ランニング",
  "record_date": "2026-06-05"
}
```

---

### Update Record

| Method | Endpoint |
|----------|----------|
| PUT | `/api/diary/{id}/` |

---

### Delete Record

| Method | Endpoint |
|----------|----------|
| DELETE | `/api/diary/{id}/` |

---

## Monthly Statistics

### Monthly Average Weight

月ごとの平均体重を取得します。

| Method | Endpoint |
|----------|----------|
| GET | `/api/diary/monthly-averages/` |

#### Response

```json
[
  {
    "month": "2026-06",
    "average_weight": 65.2
  }
]
```

---

## Height Management

### Get Height Records

| Method | Endpoint |
|----------|----------|
| GET | `/api/height-monthly/` |

#### Query Parameters

| Parameter | Description |
|------------|-------------|
| year | 年で絞り込み |

---

### Create Height Record

| Method | Endpoint |
|----------|----------|
| POST | `/api/height-monthly/` |

#### Request

```json
{
  "year": 2026,
  "month": 6,
  "height_cm": "170.5",
  "target_weight": "63.0"
}
```

---

### Latest Height Information

最新の身長・目標体重を取得します。

| Method | Endpoint |
|----------|----------|
| GET | `/api/height-monthly/latest/` |

#### Response

```json
{
  "year": 2026,
  "month": 6,
  "height_cm": "170.5",
  "target_weight": "63.0"
}
```

---

## AI Analysis

### Analyze Weight Trends

体重推移を Gemini API によって分析します。

| Method | Endpoint |
|----------|----------|
| GET | `/api/ai-analysis/` |

#### Response

```json
{
  "analysis": "先月比で0.8kg減少しています。順調に推移しています。"
}
```

---

## Authorization

認証が必要なAPIでは以下のヘッダーを指定します。

```http
Authorization: Bearer {access_token}
```

---

## Interactive API Documentation

Swagger UI

```text
http://localhost:8000/api/docs/
```

OpenAPI Schema

```text
http://localhost:8000/api/schema/
```