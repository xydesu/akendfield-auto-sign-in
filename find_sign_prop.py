
import re

file_path = "d:/project/akendfield-auto-sign/8672.fe80a180.js"
search_terms = ['"sign"', "'sign'", "sign:"]

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

for term in search_terms:
    print(f"--- Searching for: {term} ---")
    matches = [m.start() for m in re.finditer(re.escape(term), content)]
    for start_idx in matches[:10]:
        start = max(0, start_idx - 100)
        end = min(len(content), start_idx + 100)
        print(f"...{content[start:end]}...")
        print("-" * 50)
