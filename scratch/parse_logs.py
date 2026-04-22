import json
import sys

log_file = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\55359\.gemini\antigravity\brain\6e76e906-98b2-414d-bdcc-9fcd18dfbce4\.system_generated\steps\374\output.txt"

with open(log_file, 'r', encoding='utf-8') as f:
    raw = f.read()
    data = json.loads(raw)

events = data.get('result', {}).get('result', [])
events.sort(key=lambda x: x.get('timestamp', 0))

print(f"Total events found: {len(events)}")

for event in events:
    msg = event.get('event_message', '')
    status = event.get('status_code', '')
    timestamp = event.get('timestamp', '')
    level = event.get('level', 'INFO')
    
    if status:
        # HTTP lines often look like "POST | 200 | ..."
        # But sometimes they are just the summary.
        # I want to see if there's more info in the message.
        print(f"[{timestamp}] HTTP {status} | {msg}")
    else:
        # These are the internal console logs!
        print(f"[{timestamp}] [{level}] {msg}")
