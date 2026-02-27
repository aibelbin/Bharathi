import os
import requests
import base64
from PIL import Image
from io import BytesIO
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
API_URL  = os.getenv("API_URL")
MODEL    = os.getenv("MODEL")

# Aspect ratio presets for different ad platforms

POSTER_SIZES = {
    "instagram_square":   (1024, 1024),
    "instagram_portrait": (1024, 1280),
    "instagram_story":    (768,  1344),
    "facebook_post":      (1344, 768),
    "twitter_post":       (1344, 768),
    "linkedin_post":      (1344, 768),
    "general_poster":     (1024, 1024),
}


def generate_ad_poster(
    prompt: str,
    output_dir: str = "generated_posters",
    width: int = 1024,
    height: int = 1024,
    filename: str = None
):

    if not HF_TOKEN:
        return {
            "success": False,
            "filepath": None,
            "error": "HF_TOKEN not found in .env file"
        }

    enhanced_prompt = (
        f"{prompt}, "
        "professional advertisement poster, high quality, "
        "vibrant colors, sharp details, commercial photography style, "
        "marketing material, eye-catching design"
    )

    print(f"[imageGen] Generating poster for prompt: '{prompt}'")
    print(f"[imageGen] Please wait, this may take 20-40 seconds...")

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "prompt": enhanced_prompt,
        "width": width,
        "height": height,
        "num_inference_steps": 4,
        "response_format": "b64_json"
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)

        if response.status_code != 200:
            return {
                "success": False,
                "filepath": None,
                "error": f"API error {response.status_code}: {response.text[:400]}"
            }

        data = response.json()
        image_bytes = base64.b64decode(data["data"][0]["b64_json"])
        image = Image.open(BytesIO(image_bytes))

        os.makedirs(output_dir, exist_ok=True)

        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"ad_poster_{timestamp}.png"

        filepath = os.path.join(output_dir, filename)
        image.save(filepath)

        print(f"[imageGen] ✅ Poster saved to: {filepath}")

        return {
            "success": True,
            "filepath": filepath,
            "error": None
        }

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "filepath": None,
            "error": "Request timed out. Try again in a moment."
        }
    except Exception as e:
        return {
            "success": False,
            "filepath": None,
            "error": str(e)
        }


def generate_ad_poster_for_platform(
    prompt: str,
    platform: str = "instagram_square",
    output_dir: str = "generated_posters",
    filename: str = None
):
    if platform not in POSTER_SIZES:
        return {
            "success": False,
            "filepath": None,
            "error": f"Unknown platform '{platform}'. Available: {list(POSTER_SIZES.keys())}"
        }

    width, height = POSTER_SIZES[platform]
    return generate_ad_poster(prompt, output_dir, width, height, filename)