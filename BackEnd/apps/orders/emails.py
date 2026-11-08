"""
Sends the "new order" email to the admin.

The email is an HTML page that uses the website theme (wine / gold / paper) with the
logo and the customer's photo shown INSIDE the email (inline images, so Gmail shows
them without clicking "display images").

It runs in a background thread: the customer gets his answer immediately and a slow
or broken SMTP server can never make an order fail. Errors are only printed in the
server console.
"""
import threading
from pathlib import Path

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

LOGO_PATH = Path(__file__).resolve().parent / "email_assets" / "logo-cream.png"


class OrderEmail(EmailMultiAlternatives):
    """
    An email with a text version, an HTML version and images shown INSIDE the HTML.

    Final structure (what Gmail and Outlook expect):
        multipart/alternative
          |- text/plain
          `- multipart/related
               |- text/html     (uses <img src="cid:logo">)
               |- image/png     (Content-ID: logo)
               `- image/jpeg    (Content-ID: photo)
    Django 6.1 has no built-in way to do this, so we build the body ourselves.
    """

    html_body = ""
    inline_images = []   # list of (content_id, bytes, "png" / "jpeg")

    def _add_bodies(self, msg):
        msg.set_content(self.body)                        # text version
        msg.add_alternative(self.html_body, subtype="html")   # html version
        html_part = msg.get_payload()[1]
        for cid, data, subtype in self.inline_images:
            html_part.add_related(data, "image", subtype, cid=f"<{cid}>")

    def _add_attachments(self, msg):
        pass   # images were already added above


def build_order_email(order):
    """Create (but do not send) the email message for one order."""
    photo_path = Path(settings.MEDIA_ROOT) / order.model_image.name
    has_photo = photo_path.exists()

    context = {
        "order": order,
        "has_photo": has_photo,
        "dashboard_url": f"{settings.FRONTEND_URL.rstrip('/')}/dashboard",
        "sent_at": order.created_at,
    }

    message = OrderEmail(
        subject=f"طلب قفطان جديد #{order.order_number} — {order.full_name}",
        body=render_to_string("orders/new_order_email.txt", context),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.ORDER_NOTIFY_EMAIL],
    )
    message.html_body = render_to_string("orders/new_order_email.html", context)

    message.inline_images = [("logo", LOGO_PATH.read_bytes(), "png")]
    if has_photo:
        message.inline_images.append(("photo", photo_path.read_bytes(), "jpeg"))
    return message


def _send(order):
    """Runs inside the background thread."""
    try:
        build_order_email(order).send()
    except Exception as error:   # never crash the thread, just report
        print(f"[email] could not send order {order.order_number}: {error}")


def send_new_order_email(order):
    """Public function used by the view: send the email without waiting for it."""
    if not settings.ORDER_NOTIFY_EMAIL:
        print("[email] ORDER_NOTIFY_EMAIL is empty, no email sent")
        return
    threading.Thread(target=_send, args=(order,), daemon=True).start()
