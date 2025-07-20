#!/bin/bash

# 🚀 Multi-Agent Communication Demo 環境構築（旧tmux互換 & Yes/No自動応答対応版）

# ==================================================
# ✅ 設定項目
# ワーカーの数をここで指定します
NUM_WORKERS=5
# ==================================================

set -e  # エラー時に停止

# 色付きログ関数
log_info() {
    echo -e "\033[1;32m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;34m[SUCCESS]\033[0m $1"
}

TOTAL_PANES=$((NUM_WORKERS + 1))
log_info "ボス1人、ワーカー${NUM_WORKERS}人の合計${TOTAL_PANES}エージェントで環境を構築します。"
echo ""

# STEP 1: 既存セッションクリーンアップ
log_info "🧹 既存セッションクリーンアップ開始..."
tmux kill-session -t multiagent 2>/dev/null && log_info "multiagentセッション削除完了" || log_info "multiagentセッションは存在しませんでした"
mkdir -p ./tmp
log_success "✅ クリーンアップ完了"
echo ""

# STEP 2: multiagentセッション作成（1+Nペイン）
log_info "📺 multiagentセッション作成開始 (${TOTAL_PANES}ペイン)..."
tmux new-session -d -s multiagent -n "agents"
for ((i=1; i<=NUM_WORKERS; i++)); do
    tmux split-window -h -t "multiagent:0"
done
tmux select-layout -t "multiagent:0" even-horizontal

log_info "各ペインのプロンプト等を設定中..."
for i in $(seq 0 $NUM_WORKERS); do
    PANE_ID="multiagent:0.$i"
    if [ $i -eq 0 ]; then PANE_TITLE="boss"; PANE_COLOR="1;31m"; else PANE_TITLE="worker${i}"; PANE_COLOR="1;34m"; fi
    tmux send-keys -t "$PANE_ID" "cd $(pwd)" C-m
    tmux send-keys -t "$PANE_ID" "export PS1='(\[\033[${PANE_COLOR}\]${PANE_TITLE}\[\033[0m\]) \[\033[1;32m\]\w\[\033[0m\]\$ '" C-m
    tmux send-keys -t "$PANE_ID" "echo '=== ${PANE_TITLE} エージェント ==='" C-m
done
log_success "✅ multiagentセッション作成完了"
echo ""

# STEP 3: Claude Code自動起動と権限承認
log_info "🤖 Claude Codeを各ペインで自動起動し、権限プロンプトに自動応答します..."

# Bossの起動と承認
log_info "Bossエージェントを起動中..."
tmux send-keys -t multiagent:0.0 'claude --dangerously-skip-permissions' C-m

sleep 1 # プロンプトが表示されるのを待つ
#log_info "Bossのプロンプトに「Yes」で応答します..."
#tmux send-keys -t multiagent:0.0 "2" C-m # "2. Yes" を選択してEnter

# Workersの起動と承認
for i in $(seq 1 $NUM_WORKERS); do
    log_info "Worker ${i}エージェントを起動中..."
    tmux send-keys -t "multiagent:0.$i" 'claude --model claude-sonnet-4-20250514 --dangerously-skip-permissions' C-m
    sleep 1 # プロンプトが表示されるのを待つ
#    log_info "Worker ${i}のプロンプトに「Yes」で応答します..."
#    tmux send-keys -t "multiagent:0.$i" "2" C-m # "2. Yes" を選択してEnter
done

log_success "✅ 全エージェントの自動起動と承認が完了しました"
echo ""


# STEP 4: 環境確認・表示
log_info "🔍 環境確認中..."
echo ""
echo "📊 セットアップ結果:"
echo "==================="
echo "📺 Tmux Sessions:"
tmux list-sessions
echo ""
echo "📋 ペイン構成:"
echo "  multiagentセッション（${TOTAL_PANES}ペイン）:"
echo "    Pane 0: boss     (リーダー)"
for i in $(seq 1 $NUM_WORKERS); do
    printf "    Pane %-2d: worker%-2d (実行担当者)\n" "$i" "$i"
done

echo ""
log_success "🎉 Demo環境セットアップ完了！"
echo ""
echo "📋 次のステップ:"
echo "  1. 🔗 セッションアタッチ:"
echo "     tmux attach-session -t multiagent"
echo "     (セッション内では既に全エージェントが起動・承認済みで待機しています)"
echo ""
echo "  2. 🎯 デモ実行: bossペインに最初の指示を入力してください。"
echo "     例: 「あなたはbossです。worker1とworker2に自己紹介をさせてください。」"
