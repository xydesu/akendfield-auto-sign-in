
import re

file_path = "d:/project/akendfield-auto-sign/8672.fe80a180.js"
output_file = "d:/project/akendfield-auto-sign/definitions.txt"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Look for Gp = ... or function Gp
matches = []
# Regex for assignment or function def
regexes = [
    r"(?:var|const|let)\s+Gp\s*=",
    r"function\s+Gp\s*\(",
    r"Gp\s*=",
    r"Hp\s*="
]

with open(output_file, 'w', encoding='utf-8') as out:
    for r_pat in regexes:
        for m in re.finditer(r_pat, content):
            start = max(0, m.start() - 200)
            end = min(len(content), m.end() + 1000) # Get more context forward
            match_content = content[start:end]
            out.write(f"--- Match for {r_pat} ---\n")
            out.write(match_content)
            out.write("\n-------------------\n\n")

print("Done.")
