"""Import the Android source and APK from a PWABuilder package archive.

Keep the generated signing credentials in ignored work/, never in android/.
"""

from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = ROOT / "work" / "greater-height-android-package.zip"
ANDROID = ROOT / "android"
PRIVATE = ROOT / "work" / "android-signing"

SOURCE_FILES = {
    "app/build.gradle",
    "build.gradle",
    "gradle.properties",
    "gradlew",
    "gradlew.bat",
    "settings.gradle",
    "store_icon.png",
}


def save(destination: Path, data: bytes) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)


with ZipFile(ARCHIVE) as archive:
    if archive.testzip() is not None:
        raise ValueError("The Android package archive is corrupt")

    save(ROOT / "outputs" / "greater-height-books-android.apk", archive.read("Greater Height Books.apk"))
    save(ROOT / "public" / ".well-known" / "assetlinks.json", archive.read("assetlinks.json"))
    save(PRIVATE / "signing-key-info.txt", archive.read("signing-key-info.txt"))
    save(PRIVATE / "signing.keystore", archive.read("signing.keystore"))

    for name in archive.namelist():
        if not name.startswith("source/") or name.endswith("/"):
            continue
        relative = Path(name.removeprefix("source/"))
        if ".." in relative.parts or relative.is_absolute():
            raise ValueError(f"Unsafe archive path: {name}")
        if (
            relative.as_posix() in SOURCE_FILES
            or relative.parts[:2] == ("app", "src")
            or relative.parts[:2] == ("gradle", "wrapper")
        ):
            save(ANDROID / relative, archive.read(name))

print(f"APK: {ROOT / 'outputs' / 'greater-height-books-android.apk'}")
print(f"Android source: {ANDROID}")
