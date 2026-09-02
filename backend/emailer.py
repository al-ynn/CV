import os
import re
import ipaddress
import logging
import asyncio
import smtplib
import ssl
from email.message import EmailMessage
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Aleana Amurao")
EMAIL_FROM_ADDRESS = os.environ.get("EMAIL_FROM_ADDRESS", "")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp-relay.brevo.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    if not all((SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, EMAIL_FROM_ADDRESS)):
        raise RuntimeError("SMTP email settings are incomplete")

    message = EmailMessage()
    message["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM_ADDRESS}>"
    message["To"] = to
    message["Subject"] = subject
    if reply_to or EMAIL_REPLY_TO:
        message["Reply-To"] = reply_to or EMAIL_REPLY_TO
    message.set_content("This message requires an HTML-capable email client.")
    message.add_alternative(html, subtype="html")

    def _send() -> str | None:
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as smtp:
            smtp.ehlo()
            smtp.starttls(context=context)
            smtp.ehlo()
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            smtp.send_message(message)
        return message.get("Message-ID")

    return await asyncio.to_thread(_send)


def inquiry_notification_html(inq: dict) -> str:
    rows = []
    fields = [
        ("Name", inq.get("name", "")),
        ("Email", inq.get("email", "")),
        ("Company / Org", inq.get("company") or "—"),
        ("Project Type", inq.get("projectType") or "—"),
        ("Budget", inq.get("budget") or "—"),
        ("Timeline", inq.get("timeline") or "—"),
    ]
    if inq.get("brief"):
        b = inq["brief"]
        fields.append(("Estimator Range", b.get("range", "—")))
        fields.append(("Estimator Features", ", ".join(b.get("features", [])) or "—"))
    for k, v in fields:
        rows.append(
            f'<tr><td style="padding:8px 14px;font-family:monospace;font-size:11px;letter-spacing:1px;'
            f'text-transform:uppercase;color:#7c6fae;border-bottom:1px solid #eee">{escape(str(k))}</td>'
            f'<td style="padding:8px 14px;font-size:14px;color:#15132e;border-bottom:1px solid #eee">{escape(str(v))}</td></tr>'
        )
    message = escape(inq.get("message", "")).replace("\n", "<br>")
    return (
        '<table role="presentation" width="100%" style="background:#f4f4f8;padding:24px 0"><tr><td>'
        '<table role="presentation" width="600" align="center" style="background:#ffffff;border:1px solid #e2e0f0">'
        '<tr><td style="padding:20px 24px;background:#0b0a1a">'
        '<span style="font-family:monospace;font-size:11px;letter-spacing:2px;color:#a855f7">AMURAO.DEV // NEW INQUIRY</span>'
        f'<div style="font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#f2f4f8;margin-top:6px">{escape(inq.get("name", ""))} — {escape(inq.get("projectType") or "Project Inquiry")}</div>'
        '</td></tr>'
        f'<tr><td style="padding:8px 10px"><table role="presentation" width="100%">{"".join(rows)}</table></td></tr>'
        f'<tr><td style="padding:16px 24px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#15132e"><strong style="font-family:monospace;font-size:11px;letter-spacing:2px;color:#7c6fae">MESSAGE</strong><br><br>{message}</td></tr>'
        f'<tr><td style="padding:14px 24px;font-family:monospace;font-size:10px;color:#9a94b8;border-top:1px solid #eee">Sent by the amurao.dev contact system. Reply directly to {escape(inq.get("email", ""))}.</td></tr>'
        '</table></td></tr></table>'
    )


def reset_email_html(link: str) -> str:
    return (
        '<table role="presentation" width="100%" style="background:#f4f4f8;padding:24px 0"><tr><td>'
        '<table role="presentation" width="600" align="center" style="background:#ffffff;border:1px solid #e2e0f0">'
        '<tr><td style="padding:20px 24px;background:#0b0a1a">'
        '<span style="font-family:monospace;font-size:11px;letter-spacing:2px;color:#a855f7">AMURAO.DEV // ADMIN</span>'
        '<div style="font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#f2f4f8;margin-top:6px">Password reset</div>'
        '</td></tr>'
        '<tr><td style="padding:24px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#15132e">'
        '<p>A password reset was requested for your portfolio admin account. The link expires in 1 hour.</p>'
        f'<p><a href="{escape(link)}" style="color:#6d28d9">Reset your password</a></p>'
        '<p style="font-size:12px;color:#888">If you did not request this, ignore this email. '
        'We never ask for your password by email.</p>'
        '</td></tr></table></td></tr></table>'
    )
