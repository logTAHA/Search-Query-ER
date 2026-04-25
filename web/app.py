from flask import Flask, render_template, request, jsonify
import spacy
from pathlib import Path
from hazm import Normalizer

app = Flask(__name__)

MODEL_VERSION = 'v02'
MODEL_PATH = Path(__file__).parent.parent / "training" / "output" / MODEL_VERSION / "model-best"
nlp = spacy.load(MODEL_PATH)

normalizer = Normalizer()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({'error': 'Invalid request'}), 400

        original_text = data.get('text', '').strip()

        if not original_text:
            return jsonify({'error': 'Text is blank'}), 400

        # Normilizing
        normalized_text = normalizer.normalize(original_text).strip()

        if not normalized_text:
            return jsonify({'error': 'No text after nomilization'}), 400

        # Process
        doc = nlp(normalized_text)

        # extract entity from normilized text
        entities = []
        for ent in doc.ents:
            entities.append({
                'text': ent.text,
                'label': ent.label_,
                'start': ent.start_char,
                'end': ent.end_char
            })

        return jsonify({
            'original_text': original_text,
            'normalized_text': normalized_text,
            'text': normalized_text,
            'entities': entities
        })

    except Exception as e:
        return jsonify({f'Error to process: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
