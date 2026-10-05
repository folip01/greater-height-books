"""Create a Netlify Drop source archive with portable file permissions."""

from pathlib import Path
from shutil import copyfileobj
from time import localtime
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "outputs" / "greater-height-books-netlify.zip"
INCLUDE = (
    "app", "components", "docs", "lib", "public", "scripts", "supabase",
    ".env.example", ".gitignore", "AGENTS.md", "eslint.config.mjs",
    "next.config.ts", "netlify.toml", "package-lock.json", "package.json",
    "postcss.config.mjs", "proxy.ts", "README.md", "tsconfig.json",
)


def main() -> None:
    files = []
    for name in INCLUDE:
        path = ROOT / name
        files.extend(sorted(path.rglob("*")) if path.is_dir() else [path])
    files = [path for path in files if path.is_file()]
    OUTPUT.parent.mkdir(exist_ok=True)
    with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED, compresslevel=6) as archive:
        for path in files:
            entry = ZipInfo(path.relative_to(ROOT).as_posix(), localtime(path.stat().st_mtime)[:6])
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            entry.compress_type = ZIP_DEFLATED
            with path.open("rb") as source, archive.open(entry, "w", force_zip64=True) as destination:
                copyfileobj(source, destination)
    with ZipFile(OUTPUT) as archive:
        names = set(archive.namelist())
        assert "package.json" in names
        assert not any(name.startswith(("node_modules/", ".next/", "work/", "outputs/")) for name in names)
        assert ".env.local" not in names
        print(f"Created {OUTPUT.name}: {len(names)} files, {OUTPUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
