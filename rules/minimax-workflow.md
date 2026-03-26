# MiniMax Multi-Modal Workflow Rules

## API Key Management

- API Key stored at `~/.claude/env.d/minimax.env`
- Scripts MUST read key from env var `MINIMAX_API_KEY`
- NEVER hardcode API key in any script

## Output Directory

- All generated files go to `minimax-output/` in the current working directory
- Intermediate/temp files go in `minimax-output/tmp/`

## Asset Generation Priority

When a task involves multiple asset types, generate in this order:
1. **Images first** (foundation for video)
2. **Audio/TTS second** (independent of visuals)
3. **Video third** (depends on images)
4. **Music last** (independent)

## Error Handling Pattern

All MiniMax API scripts MUST check this response structure:
```python
base_resp = data.get("base_resp", {})
if base_resp.get("status_code", 0) != 0:
    raise SystemExit(f"API Error [{base_resp.get('status_code')}]: {base_resp.get('status_msg')}")
```

## API Host Resolution

```
if os.environ.get("MINIMAX_API_HOST"):
    API_BASE = os.environ["MINIMAX_API_HOST"]
else:
    API_BASE = "https://api.minimax.io"
```

## Script Capability Matrix

| Asset | Script | Sync/Async | Key Models |
|-------|--------|------------|------------|
| TTS | minimax_tts.py | Sync | speech-2.8-hd, speech-2.8-turbo |
| Music | minimax_music.py | Sync | music-2.5+ |
| Image | minimax_image.py | Sync | image-01 |
| Video | minimax_video.py | Async | MiniMax-Hailuo-2.3, I2V-01-Director |
| Voice Clone | minimax_voice.py | Async | voice_clone |
| Voice Design | minimax_voice.py | Async | voice_design |

## Video Polling Pattern

```python
import time
def poll_video(task_id, max_wait=600, interval=10):
    for _ in range(max_wait // interval):
        resp = requests.get(f"{API_BASE}/query/video_generation", params={"task_id": task_id}, headers=headers)
        data = resp.json()
        status = data.get("status", "")
        if status == "Success": return data.get("file_id")
        elif status == "Fail": raise SystemExit(f"Video failed: {data}")
        elif not status:
            print(f"Unexpected response: {data}, retrying...")
        time.sleep(interval)
    raise SystemExit("Video polling timeout")
```

## Skill Chaining

- `gif-sticker-maker` depends on `minimax-multimodal-toolkit` scripts
- `frontend-dev` depends on `minimax-multimodal-toolkit` scripts
- These are peer skills, not nested — always reference `minimax-multimodal-toolkit/scripts/` from within other skills

## Quality Gates

1. All SKILL.md files must pass `validate_skills.py` before commit
2. All scripts must verify `MINIMAX_API_KEY` is set before making API calls
3. All file paths in scripts must be absolute or resolved relative to script location
