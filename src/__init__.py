import spacy

print("spaCy:", spacy.__version__)

try:
    import cupy as cp
    print("CuPy:", cp.__version__)
    print("GPU count:", cp.cuda.runtime.getDeviceCount())
    print("GPU name:", cp.cuda.runtime.getDeviceProperties(0)["name"])
except Exception as e:
    print("CuPy import error:")
    print(repr(e))

try:
    spacy.require_gpu(0)
    print("spaCy GPU: OK")
except Exception as e:
    print("spaCy GPU error:")
    print(repr(e))

print("prefer_gpu:", spacy.prefer_gpu())
