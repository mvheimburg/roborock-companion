"""Bounded map-header audit, complementing the official geometry parser.

Do not render or reconstruct robot maps here. Unknown restriction data blocks
replacement, so an editor cannot discard geometry the HA parser did not retain.
"""

import gzip
import io
import struct

LIMIT = 4 * 1024 * 1024
KNOWN = set(range(1, 19)) | {22, 24, 28, 32, 39, 1024}


def audit_map(encoded):
    failed = {"blocker": "preservation_unverified", "counts": {}}
    if not isinstance(encoded, bytes) or not 20 <= len(encoded) <= LIMIT:
        return failed
    try:
        raw = encoded
        if encoded[:2] == b"\x1f\x8b":
            with gzip.GzipFile(fileobj=io.BytesIO(encoded)) as stream:
                raw = stream.read(LIMIT + 1)
        if len(raw) > LIMIT or raw[:2] != b"rr":
            return failed
        offset = struct.unpack_from("<H", raw, 2)[0]
        if not 20 <= offset <= min(len(raw), 1024):
            return failed
        counts, seen, blocks = {}, set(), 0
        while offset < len(raw):
            kind, header, length = struct.unpack_from("<HHI", raw, offset)
            if header < 8 or header > 1024 or length > LIMIT or offset + header + length > len(raw):
                return failed
            blocks += 1
            if blocks > 256 or kind not in KNOWN or (kind == 12 and length):
                return failed
            if kind in (9, 10):
                size = 16 if kind == 9 else 8
                if length % size:
                    return failed
                counts[kind] = length // size
            seen.add(kind)
            offset += header + length
        if not {2, 1024} <= seen or offset != len(raw):
            return failed
        return {"blocker": None, "counts": counts}
    except OSError, EOFError, struct.error, ValueError:
        return failed
