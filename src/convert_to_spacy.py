import json
import spacy
from spacy.tokens import DocBin
from pathlib import Path
from sklearn.model_selection import train_test_split

data_version = "v02"

input_path = Path(f"data/processed/{data_version}/train_cleaned.json")
output_dir = Path(f"data/processed/{data_version}")
output_dir.mkdir(parents=True, exist_ok=True)

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

train_data, dev_data = train_test_split(
    data,
    test_size=0.2,
    random_state=42
)

nlp = spacy.blank("fa")


def convert(data, output_path):
    doc_bin = DocBin()

    for text, annotations in data:
        doc = nlp.make_doc(text)
        ents = []

        for start, end, label in annotations.get("entities", []):
            span = doc.char_span(start, end, label=label, alignment_mode="contract")

            if span is None:
                print("Skipping entity:")
                print(text)
                print(start, end, label)
                print(text[start:end])
                continue

            ents.append(span)

        doc.ents = ents
        doc_bin.add(doc)

    doc_bin.to_disk(output_path)


convert(train_data, output_dir / "train.spacy")
convert(dev_data, output_dir / "dev.spacy")

print("Done.")
print("Train size:", len(train_data))
print("Dev size:", len(dev_data))
