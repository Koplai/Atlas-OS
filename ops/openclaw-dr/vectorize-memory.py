#!/usr/bin/env python3
import os, json, glob, hashlib, uuid, urllib.request
from pathlib import Path

WORKSPACE = Path('/root/.openclaw/workspace')
FILES = [WORKSPACE / 'MEMORY.md'] + sorted((WORKSPACE / 'memory').glob('*.md'))
QDRANT = 'http://127.0.0.1:6333'
COLLECTION = 'atlas_memory'
OLLAMA = 'http://127.0.0.1:11434/api/embeddings'
EMBED_MODEL = 'nomic-embed-text:latest'


def request_json(url, payload=None, method='POST'):
    data = None if payload is None else json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, method=method, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read().decode('utf-8')
        return json.loads(raw) if raw else {}


def ensure_collection(dim=768):
    try:
        urllib.request.urlopen(f"{QDRANT}/collections/{COLLECTION}", timeout=10)
        return
    except Exception:
        pass
    request_json(f"{QDRANT}/collections/{COLLECTION}", {
        'vectors': {'size': dim, 'distance': 'Cosine'}
    }, method='PUT')


def embed(text):
    r = request_json(OLLAMA, {'model': EMBED_MODEL, 'prompt': text}, method='POST')
    return r['embedding']


def chunks(text, size=900):
    text = text.strip()
    if not text:
        return []
    out = []
    i = 0
    while i < len(text):
        out.append(text[i:i+size])
        i += size
    return out


def point_id(source, idx, ch):
    h = hashlib.sha256((source + str(idx) + ch).encode()).hexdigest()[:32]
    return str(uuid.UUID(h))


def main():
    first_vec = embed('healthcheck vector warmup')
    ensure_collection(len(first_vec))

    points = []
    for fp in FILES:
        if not fp.exists():
            continue
        txt = fp.read_text(encoding='utf-8', errors='ignore')
        for i, ch in enumerate(chunks(txt)):
            vec = embed(ch)
            pid = point_id(str(fp), i, ch)
            points.append({
                'id': pid,
                'vector': vec,
                'payload': {
                    'source': str(fp.relative_to(WORKSPACE)),
                    'chunk': i,
                    'text': ch
                }
            })

    if points:
        request_json(f"{QDRANT}/collections/{COLLECTION}/points?wait=true", {'points': points}, method='PUT')
    print(json.dumps({'status': 'ok', 'collection': COLLECTION, 'points': len(points)}))


if __name__ == '__main__':
    main()
