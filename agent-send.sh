#!/bin/bash

# 🚀 Agent間メッセージ送信スクリプト（Nワーカー自動判別版）

# エージェント名からtmuxターゲットを取得する
# worker1, worker2... のような名前に対応
get_agent_target() {
    local agent_name="$1"

    if [[ "$agent_name" == "boss" ]]; then
        echo "multiagent:0.0"
    # "worker"とそれに続く数字（例: worker1, worker12）にマッチ
    elif [[ "$agent_name" =~ ^worker([1-9][0-9]*)$ ]]; then
        local worker_num="${BASH_REMATCH[1]}"
        # 実際にその番号のペインが存在するか確認
        if tmux list-panes -t multiagent:0 -F '#{pane_index}' | grep -q "^${worker_num}$"; then
            echo "multiagent:0.${worker_num}"
        else
            echo "" # 存在しない場合は空文字を返す
        fi
    else
        echo ""
    fi
}

# 使い方を表示
show_usage() {
    cat << EOF
🤖 Agent間メッセージ送信 (Nワーカー対応版)

使用方法:
  $0 [エージェント名] [メッセージ]
  $0 --list

エージェント名:
  boss
  worker1, worker2, ... (現在起動中のワーカー)

使用例:
  $0 boss "全ワーカーに状況報告を指示"
  $0 worker1 "タスクAが完了しました"
EOF
}

# 現在利用可能なエージェント一覧を動的に表示
show_agents() {
    if ! check_target "multiagent" >/dev/null; then
        exit 1
    fi

    echo "📋 利用可能なエージェント:"
    echo "=========================="
    # bossは常に表示
    printf "  %-10s → multiagent:0.%-5s (%s)\n" "boss" "0" "リーダー"
    
    # tmuxから現在存在するworkerペインの情報を取得して一覧表示
    # ★★★ 修正点 ★★★
    # `tail`に頼らず、ループ内でpane_indexが0でないことを確認する方法に変更。
    # これにより、tmuxの出力順に依存しない堅牢なリスト表示になる。
    tmux list-panes -t multiagent:0 -F '#{pane_index}' | while read -r pane_index; do
        if [[ "$pane_index" -ne 0 ]]; then
            printf "  %-10s → multiagent:0.%-5s (%s)\n" "worker${pane_index}" "${pane_index}" "実行担当者"
        fi
    done
}


# ログ記録
log_send() {
    local agent="$1"
    local message="$2"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    mkdir -p logs
    echo "[$timestamp] TO $agent: SENT - \"$message\"" >> logs/send_log.txt
}

# メッセージ送信
send_message() {
    local target="$1"
    local message="$2"
    
    echo "📤 送信中: $target ← '$message'"
    
    # Claude Codeのプロンプトを一度クリア (Ctrl+C)
#    tmux send-keys -t "$target" C-c
#    sleep 0.5
    
    # メッセージ送信
    tmux send-keys -t "$target" "$message"
    sleep 1
    
    # エンター押下
    tmux send-keys -t "$target" C-m
    sleep 1.0
    tmux send-keys -t "$target" C-m
    sleep 1.0
}

# ターゲットセッションの存在確認
check_target() {
    local session_name
    session_name=$(echo "$1" | cut -d: -f1)
    
    if ! tmux has-session -t "$session_name" 2>/dev/null; then
        echo "❌ セッション '$session_name' が見つかりません。先にsetup.shを実行してください。"
        return 1
    fi
    return 0
}

# メイン処理
main() {
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi
    
    # --listオプション
    if [[ "$1" == "--list" ]]; then
        show_agents
        exit 0
    fi
    
    if [[ $# -lt 2 ]]; then
        show_usage
        exit 1
    fi
    
    local agent_name="$1"
    shift
    local message="$*" # 残りの引数全てをメッセージとして扱う
    
    # ターゲットセッションの存在確認
    if ! check_target "multiagent"; then
        exit 1
    fi
    
    # エージェントターゲット取得
    local target
    target=$(get_agent_target "$agent_name")
    
    if [[ -z "$target" ]]; then
        echo "❌ エラー: 不明なエージェント、または存在しないワーカー '$agent_name'"
        echo "利用可能なエージェントは '$0 --list' で確認できます。"
        exit 1
    fi
    
    # メッセージ送信
    send_message "$target" "$message"
    
    # ログ記録
    log_send "$agent_name" "$message"
    
    echo "✅ 送信完了: $agent_name に '$message'"
    
    return 0
}

main "$@"
