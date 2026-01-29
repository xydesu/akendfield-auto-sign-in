
import os
import re

files = [
    "d:/project/akendfield-auto-sign/4046.7fed78ef.js",
    "d:/project/akendfield-auto-sign/8672.fe80a180.js",
    "d:/project/akendfield-auto-sign/9779.167cd594.js"
]

keyword = "attendance"
context_len = 300
output_file = "attendance_analysis.txt"

with open(output_file, 'w', encoding='utf-8') as out:
    for file_path in files:
        if not os.path.exists(file_path):
            out.write(f"File not found: {file_path}\n")
            continue
            
        out.write(f"\n--- Scanning {os.path.basename(file_path)} ---\n")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            matches = [m.start() for m in re.finditer(keyword, content, re.IGNORECASE)]
            out.write(f"Found {len(matches)} matches.\n")
            
            for i, start_index in enumerate(matches):
                start = max(0, start_index - context_len)
                end = min(len(content), start_index + len(keyword) + context_len)
                sample = content[start:end]
                # Replace newlines with spaces to keep it on one line per match block roughly
                sample = sample.replace('\n', ' ')
                out.write(f"Match {i+1} index {start_index}:\n...{sample}...\n\n")
                
        except Exception as e:
            out.write(f"Error reading {file_path}: {e}\n")

print("Done.")
