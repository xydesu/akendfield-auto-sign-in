
import re

file_path = "d:/project/akendfield-auto-sign/8672.fe80a180.js"
search_terms = ["sign", "signature", "md5"]

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Look for patterns like "sign:" or "sign=" followed by variable
# and try to capture the surrounding code block
patterns = [
    r'([a-zA-Z0-9_$]+\.sign\s*=|sign\s*:)', 
    r'(MD5|md5)\(',
    r'(\"sk-game-role\")'
]

for patt in patterns:
    print(f"--- Searching pattern: {patt} ---")
    for match in re.finditer(patt, content):
        start = max(0, match.start() - 300)
        end = min(len(content), match.end() + 300)
        print(f"...{content[start:end]}...")
        print("-" * 50)
