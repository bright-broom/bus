# Supabase セットアップ手順

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスし、アカウントを作成またはログイン
2. 「New Project」をクリック
3. 以下の情報を入力：
   - Organization: 任意の組織名
   - Name: `bus-schedule` など任意のプロジェクト名
   - Database Password: 安全なパスワードを生成して保存
   - Region: `Northeast Asia (Tokyo)` を選択
4. 「Create new project」をクリック

## 2. データベース接続情報の取得

1. プロジェクトのダッシュボードで「Project Settings」→「Database」を選択
2. 「Connection string」セクションから以下の情報をコピー：
   - Connection string (URI形式)
   - Host
   - Database name
   - Port
   - User
   - Password

## 3. 環境変数の設定

1. プロジェクトのルートディレクトリに `.env` ファイルを作成
2. 以下の環境変数を設定：

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"
```

- `[YOUR-PASSWORD]`: ステップ1で設定したデータベースパスワード
- `[YOUR-PROJECT-ID]`: SupabaseプロジェクトのユニークなプロジェクトID

## 4. データベースのマイグレーション

1. 以下のコマンドを実行してPrismaマイグレーションを適用：

```bash
npm run db:migrate
```

2. サンプルデータを投入（開発環境のみ）：

```bash
npm run db:seed
```

## 5. セキュリティ設定

1. Supabaseダッシュボードで「Authentication」→「Settings」を選択
2. 「Email Auth」を有効化し、以下を設定：
   - Confirm email: 必要に応じて有効化
   - Secure email change: 推奨
3. 「Project Settings」→「API」で以下を確認：
   - `anon` キーと `service_role` キーを確認
   - これらは公開しないよう注意

## 6. Row Level Security (RLS)の設定

1. SQLエディタで以下のポリシーを設定：

```sql
-- 読み取りポリシー
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Routes are viewable by everyone" ON routes FOR SELECT USING (true);

ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stops are viewable by everyone" ON stops FOR SELECT USING (true);

ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RouteStops are viewable by everyone" ON route_stops FOR SELECT USING (true);

ALTER TABLE departures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departures are viewable by everyone" ON departures FOR SELECT USING (true);

-- 書き込みポリシー（管理者のみ）
CREATE POLICY "Routes are editable by admins" ON routes 
FOR ALL USING (auth.role() = 'authenticated' AND auth.email() = 'your-admin-email@example.com');

-- 他のテーブルも同様に設定
```

## 7. バックアップ設定

1. 「Project Settings」→「Database」→「Backups」を選択
2. 「Enable Point-in-Time Recovery」を有効化（推奨）
3. バックアップスケジュールを確認・設定

## 注意事項

- 本番環境の`DATABASE_URL`は必ず環境変数として設定し、ソースコードにハードコードしないこと
- `service_role`キーは極めて慎重に扱い、必要な場合のみバックエンド処理で使用すること
- 定期的にバックアップを確認し、必要に応じてリストア手順をテストすること