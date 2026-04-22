$content = Get-Content 'C:\Users\55359\.gemini\antigravity\brain\67dd209b-a602-4dbd-bf4e-96390395f845\.system_generated\steps\1835\output.txt' | ConvertFrom-Json
$content.result.result | Where-Object { $_.event_message -notmatch '^(POST|GET|OPTIONS|PUT|DELETE|PATCH) \|' } | ForEach-Object {
    Write-Output $_.event_message
}
