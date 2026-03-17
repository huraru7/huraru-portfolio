---
id: project1
title: Console Othello
subtitle: オセロAIを搭載したシンプルなオセロゲーム
tags: C#,Task
summary: consoleで動かすシンプルオセロ
image: images/Asset/ConsoleOthello.png
teamSize: 1人
period: 5ヶ月
startDate: 2025/11/13
endDate:
---

## プロジェクト概要

consoleで動作するAI対戦可能なオセロ

### ゲームモード

- **Player vs AI** — 人間 vs コンピュータ（4段階難易度）
- **Player vs Player** — ローカル対戦
- **AI vs AI** — AI同士の自動対局（学習用）
- **Training Mode** — 評価関数の重みを調節（学習用）

### 実装した主な技術

- **ビットボード**: 盤面を 64-bit 整数2つで表現し、石の裏返しや合法手生成をビット演算で高速化
- **PVS + 反復深化**: α-β 枝刈りをベースに置換表・指し手オーダリング・完全読みを組み合わせた探索エンジン
- **評価関数（3フェーズ）**: 序盤〜終盤でコーナー価値・移動自由度・安定石などの重みを動的に切り替え
- **機械学習（焼きなまし法）**: AI同士の自動対局を繰り返し、評価パラメータを自動最適化

## 工夫した点・学んだ点

### ゲームAIに対する理解向上

『強いAI』を作る中で、ゲームを内部から詳しく調査する機会を得ることができた。普段のプレイヤー目線からでは得ることのできない、ゲームの視点を新しく得ることができた。

### アルゴリズム・最適化への興味関心

オセロのAIを作る上で、現代において技術の向上などから重視されにくい、最適化。

## リポジトリ

GitHub: [huraru7/ConsoleOthello](https://github.com/huraru7/ConsoleOthello)
