import asyncio
import json
import os
import certifi
import edge_tts

os.environ['SSL_CERT_FILE'] = certifi.where()

VOICE = 'he-IL-HilaNeural'
RATE = '+12%'
PITCH = '+3Hz'

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'audio', 'hints'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

JSON_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), 'hint_items.json'))
with open(JSON_FILE, 'r', encoding='utf-8') as f:
    ITEMS = [(item['id'], item['text']) for item in json.load(f)]

async def generate_selected(filter_ids=None):
    for item_id, text in ITEMS:
        if filter_ids and item_id not in filter_ids:
            continue
        out_file = os.path.join(OUTPUT_DIR, f"{item_id}.mp3")
        tmp_file = out_file + ".tmp"
        try:
            comm = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
            await comm.save(tmp_file)
            if os.path.exists(tmp_file) and os.path.getsize(tmp_file) > 1000:
                os.replace(tmp_file, out_file)
                print(f"Updated {item_id}.mp3 ({os.path.getsize(out_file) // 1024} KB)")
        except Exception as e:
            if os.path.exists(tmp_file):
                os.remove(tmp_file)
            print(f"Skipped {item_id} (offline/cached): {e}")

if __name__ == '__main__':
    asyncio.run(generate_selected(None))

