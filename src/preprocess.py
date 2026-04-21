from hazm import Normalizer

class PreprocessData:
    def __init__(self):
        self.normalizer = Normalizer()

    def prepare_text(self, text):
        return self.normalizer.normalize(text)
