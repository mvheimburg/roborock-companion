import struct

from custom_components.roborock_companion.map_audit import audit_map


def map_bytes(*blocks):
    header = b"rr" + struct.pack("<H", 20) + bytes(16)
    image = struct.pack("<HHI", 2, 8, 1) + b"x"
    digest = struct.pack("<HHI", 1024, 8, 0)
    return (
        header
        + image
        + b"".join(
            (
                struct.pack("<HHIHH", kind, 12, len(body), len(body) // (16 if kind == 9 else 8), 0)
                if kind in (9, 10)
                else struct.pack("<HHI", kind, 8, len(body))
            )
            + body
            for kind, body in blocks
        )
        + digest
    )


def test_audit_allows_only_preservable_restrictions():
    assert audit_map(map_bytes((9, bytes(16)), (10, bytes(8))))["blocker"] is None
    assert audit_map(map_bytes((23, bytes(16))))["blocker"] == "preservation_unverified"
    assert audit_map(map_bytes((12, bytes(16))))["blocker"] == "preservation_unverified"
    assert audit_map(map_bytes((99, b"unknown")))["blocker"] == "preservation_unverified"


def test_malformed_or_truncated_map_cannot_enable_writes():
    for raw in (b"", b"rr", map_bytes()[:-2], bytes(64)):
        assert audit_map(raw)["blocker"] == "preservation_unverified"
