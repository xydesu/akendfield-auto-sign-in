
# Python script to search for specific strings in a minified file and print context
import re

file_path = "d:/project/akendfield-auto-sign/8672.fe80a180.js"
search_terms = ["sk-game-role", "sign", "signature", "md5"]

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

for term in search_terms:
    print(f"--- Searching for: {term} ---")
    matches = [m.start() for m in re.finditer(re.escape(term), content)]
    for start_idx in matches[:5]: # limit to first 5 matches per term
        start = max(0, start_idx - 200)
        end = min(len(content), start_idx + 200)
        print(f"...{content[start:end]}...")
        print("-" * 50)
