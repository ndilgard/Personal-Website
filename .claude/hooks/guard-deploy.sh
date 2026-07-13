#!/bin/bash
input=$(cat)
cmd=$(echo "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")

if echo "$cmd" | grep -q "deploy.sh"; then
    echo '{"decision":"block","reason":"deploy.sh pushes to AWS. Review changes first, then run it manually in your terminal."}'
    exit 1
fi
