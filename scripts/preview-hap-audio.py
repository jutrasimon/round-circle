"""Build a private playable preview; never copy licensed assets into public dist."""
import argparse
import io
import json
import math
from pathlib import Path
import shutil
import struct
import wave
import zipfile

SOUNDS = {
    'ui': 'SFX/Menu/Menu_Click.wav',
    'shot': 'SFX/Firepower/LazerFire3.wav',
    'impact': 'SFX/Firepower/Hit_Enemy_02.wav',
    'death': 'SFX/Firepower/Vaporise.wav',
    'spawn': 'SFX/Actions/Grow01.wav',
    'wave': 'SFX/Environment/Alarm2.wav',
    'reward': 'SFX/Actions/Activate_Power.wav',
    'dialogue': 'SFX/Speech/Text_Short.wav',
}

def prepare(data, max_duration=1.9):
    with wave.open(io.BytesIO(data)) as source:
        channels, width, rate, count, *_ = source.getparams()
        if width not in (2, 3, 4):
            raise ValueError('Expected signed PCM WAV')
        raw = source.readframes(count)
    samples = []
    for offset in range(0, len(raw), width * channels):
        samples.append(sum(int.from_bytes(raw[offset+c*width:offset+(c+1)*width], 'little', signed=True)
                           for c in range(channels)) / channels / (2 ** (width * 8 - 1)))
    # Remove leading/trailing silence, retain a little space around the transient.
    audible = [i for i, value in enumerate(samples) if abs(value) > .001]
    if not audible:
        raise ValueError('Silent sample')
    samples = samples[max(0, audible[0]-int(rate*.002)):min(len(samples), audible[-1]+int(rate*.012)+1)]
    if max_duration is not None:
        samples = samples[:int(rate*max_duration)]
    peak = max(abs(value) for value in samples)
    rms = math.sqrt(sum(value*value for value in samples)/len(samples))
    gain = min(.6/peak, .16/rms, 4)
    fade = max(1, int(rate*.005))
    pcm = b''.join(struct.pack('<h', round(value*gain*min(1, i/fade, (len(samples)-1-i)/fade)*32767))
                   for i, value in enumerate(samples))
    out = io.BytesIO()
    with wave.open(out, 'wb') as target:
        target.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
        target.writeframes(pcm)
    return out.getvalue(), round(len(samples)/rate, 3)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('archive', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    target = root / '.local-audio-preview'
    # The whole preview is gitignored because the supplied license excludes source redistribution.
    shutil.copytree(root/'dist', target, dirs_exist_ok=True)
    report = []
    with zipfile.ZipFile(args.archive) as archive:
        for cue, source in SOUNDS.items():
            data, duration = prepare(archive.read(source))
            (target/'assets/audio'/f'{cue}.wav').write_bytes(data)
            report.append({'cue': cue, 'source': source, 'seconds': duration})
        (target/'HAP-license.rtf').write_bytes(archive.read('8Bit SFX and Music Pack Terms and Conditions.rtf'))
    html = (target/'index.html').read_text(encoding='utf-8').replace('Gym 019', 'Gym 019 · HAP').replace('GYM / 019', 'GYM / 019 · HAP')
    (target/'index.html').write_text(html, encoding='utf-8')
    audio = (target/'audio.js').read_text(encoding='utf-8').replace('Huit sons provisoires partagés entre les actions.', 'Huit effets 8-bit du pack Hunter Audio Production.')
    (target/'audio.js').write_text(audio, encoding='utf-8')
    (target/'selection.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
