mkdir pages

for i in $(seq 1 57); do
  echo "Downloading page $i"
  curl -s \
    -H "User-Agent: Mozilla/5.0" \
    "https://icarnatic.org/Season2025.aspx?page=$i" \
    -o "pages/page_$i.html"
done