# SNS-SQS-Lambda イベント駆動型アーキテクチャ

## 概要

AWS CDKを使用したイベント駆動型アーキテクチャの実装です。Amazon SNS、SQS、Lambdaを組み合わせることで、スケーラブルで疎結合な非同期メッセージ処理システムを実現しています。

## アーキテクチャ

![アーキテクチャ図](./docs/architecture.drawio)

### システムフロー

```
Publisher → Amazon SNS → Amazon SQS → AWS Lambda → CloudWatch Logs
```

1. アプリケーションがSNSトピックにメッセージを発行
2. SNSがサブスクライブされているSQSキューへメッセージを配信
3. SQSがメッセージをバッファリングし、Lambda関数をトリガー
4. Lambda関数がメッセージを処理し、CloudWatch Logsへ出力

### アーキテクチャの特徴

- **疎結合**: SNS/SQSによるPublisher-Subscriber間の分離
- **スケーラビリティ**: Lambdaの自動スケーリングによる大量メッセージ処理
- **耐障害性**: SQSの可視性タイムアウトと再試行機能によるメッセージ保護
- **可観測性**: CloudWatch Logsによる統合ログ管理

## プロジェクト構成

```
sns-sqs-lambda/
├── bin/
│   └── sns-sqs-lambda.ts          # CDKアプリケーション エントリーポイント
├── lib/
│   └── sns-sqs-lambda-stack.ts    # インフラ定義（CDKスタック）
├── lambda/
│   └── index.ts                   # Lambda関数実装
├── docs/
│   └── architecture.drawio        # システム構成図
└── test/
    └── sns-sqs-lambda.test.ts     # ユニットテスト
```

## 動作確認

```bash
# メッセージ送信
aws sns publish \
  --topic-arn <TOPIC_ARN> \
  --message '{"type":"order","orderId":"12345","amount":5000}'

# ログ確認
aws logs tail /aws/lambda/sns-sqs-lambda-function --follow
```

## 設計のポイント

### Infrastructure as Code

AWS CDKによるインフラのコード化:
- TypeScriptによる型安全なインフラ定義
- CloudFormation自動生成
- リソース命名規則の統一（ケバブケース）

### 非同期処理パターン

SNS/SQSによる疎結合なメッセージング:
- Pub/Sub型のイベント駆動設計
- SQSによる処理速度の平準化
- Lambda関数のバッチ処理（最大10件/5秒）

### エラーハンドリング

- 可視性タイムアウト: 300秒
- メッセージ保持期間: 4日間
- 自動再試行機能
