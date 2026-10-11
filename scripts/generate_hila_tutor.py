import asyncio
import os
import certifi
import edge_tts

os.environ['SSL_CERT_FILE'] = certifi.where()

VOICE = 'he-IL-HilaNeural'
RATE = '+12%'
PITCH = '+3Hz'

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'audio', 'tutor'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

import json

JSON_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), 'tutor_items.json'))
if os.path.exists(JSON_FILE):
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        ITEMS = [(item['id'], item['text']) for item in data]
else:
    print("Warning: tutor_items.json not found, using fallback minimal list")
    ITEMS = []

async def generate_all():
    print(f"🎙️ Starting batch generation with {VOICE} (Rate: {RATE}, Pitch: {PITCH})")
    print(f"Total items: {len(ITEMS)}")
    print(f"Output directory: {OUTPUT_DIR}\n")

    for idx, (item_id, text) in enumerate(ITEMS, 1):
        out_file = os.path.join(OUTPUT_DIR, f"{item_id}.mp3")
        print(f"[{idx}/{len(ITEMS)}] Generating {item_id}.mp3 ...")
        comm = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
        await comm.save(out_file)
        size_kb = os.path.getsize(out_file) / 1024
        print(f"       -> Saved ({size_kb:.1f} KB)")

    print(f"\n✅ All {len(ITEMS)} tutor audio items generated successfully!")

if __name__ == '__main__':
    asyncio.run(generate_all())

