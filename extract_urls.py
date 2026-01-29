import re

file_path = "d:/project/akendfield-auto-sign/8672.fe80a180.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

urls = re.findall(r'https?://[^\s"\']+', content)

for url in urls:
    if "gryph" in url or "endfield" in url:
        print(url)
