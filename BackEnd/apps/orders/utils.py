"""Small helpers for the order photos."""
import uuid
from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

MAX_SIDE = 1600   # pixels: big enough to see the embroidery, small enough to stay fast
JPEG_QUALITY = 85


def optimize_image(uploaded_file):
    """
    Take the photo sent by the customer and return a lighter JPEG.

    Phone photos are often 5-10 MB. This:
      - rotates the picture the right way (phones store the rotation separately)
      - shrinks it to at most 1600 px on the longest side
      - saves it as a JPEG (transparent PNGs get a white background)
    Result: usually 200-400 KB, so the dashboard and the email load quickly.
    """
    image = Image.open(uploaded_file)
    image = ImageOps.exif_transpose(image)

    # JPEG has no transparency: paste PNG/WEBP with transparency on white
    if image.mode in ("RGBA", "LA", "P"):
        image = image.convert("RGBA")
        white = Image.new("RGB", image.size, (255, 255, 255))
        white.paste(image, mask=image.split()[-1])
        image = white
    else:
        image = image.convert("RGB")

    image.thumbnail((MAX_SIDE, MAX_SIDE))   # keeps the proportions, never enlarges

    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return ContentFile(buffer.getvalue(), name=f"{uuid.uuid4().hex}.jpg")
