import json
from collections import Counter

path = "data/processed/v02/train_cleaned.json"

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

label_counter = Counter()
total_entities = 0

for text, ann in data:
    entities = ann.get("entities", [])
    total_entities += len(entities)

    for start, end, label in entities:
        label_counter[label] += 1

print("Total samples:", len(data))
print("Total entities:", total_entities)
print("Labels:")
for label, count in label_counter.items():
    print(label, count)
