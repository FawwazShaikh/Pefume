import os
from PIL import Image

output_dir = r"c:\Users\Armash Ansari\OneDrive\Desktop\Projects\Websites\Pefume\frontend\public\bottles"
os.makedirs(output_dir, exist_ok=True)

brain_dir = r"C:\Users\Armash Ansari\.gemini\antigravity-ide\brain\58b13246-4a59-4cc0-8176-14392a5eade2"
decant_dir = r"c:\Users\Armash Ansari\OneDrive\Desktop\Projects\Websites\Pefume\frontend\public\decant_images"

# Map of output filename -> source file
mappings = {
    "classic_mini_black.webp": os.path.join(decant_dir, "bottle_5ml_black.webp"),
    "classic_mini_gold.webp": os.path.join(decant_dir, "bottle_5ml_gold.webp"),
    "metal_atomizer_black.webp": os.path.join(decant_dir, "bottle_10ml_black.webp"),
    "metal_atomizer_gold.webp": os.path.join(decant_dir, "bottle_10ml_gold.webp"),
    "premium_metal_atomizer.webp": os.path.join(decant_dir, "bottle_10ml_premium.webp"),
    "travel_safe_black.webp": os.path.join(decant_dir, "bottle_10ml_travel.webp"),
    
    # 4 new images attached:
    "travel_safe_magenta.webp": os.path.join(brain_dir, "media__1784646738101.jpg"),
    "travel_safe_rose_gold.webp": os.path.join(brain_dir, "media__1784646745871.jpg"),
    "travel_safe_crimson.webp": os.path.join(brain_dir, "media__1784646750119.jpg"),
    "travel_safe_silver.webp": os.path.join(brain_dir, "media__1784646754581.jpg"),
}

for out_name, src_path in mappings.items():
    if os.path.exists(src_path):
        out_path = os.path.join(output_dir, out_name)
        img = Image.open(src_path)
        # Convert to RGB if needed (JPEG/PNG/WebP)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        # Resize to max 800x800 maintaining aspect ratio
        img.thumbnail((800, 800), Image.Resampling.LANCZOS)
        img.save(out_path, "WEBP", quality=85, optimize=True)
        print(f"Processed {out_name} -> {os.path.getsize(out_path)} bytes")
    else:
        print(f"WARNING: Source file missing: {src_path}")
