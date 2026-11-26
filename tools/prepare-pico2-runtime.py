#!/usr/bin/env python3
"""Prepare browser assets from a Pico SDK 2.3.1 Unix Makefiles build."""
from pathlib import Path
import argparse
import re
import shlex
import subprocess


def linker_script(path, search):
    def include(match):
        name = match[1]
        file = next((folder / name for folder in search if (folder / name).is_file()), None)
        if file is None:
            raise ValueError(f"Cannot find linker include {name}")
        return linker_script(file, search)

    return re.sub(
        r'^\s*INCLUDE\s+"?([^"\s]+)"?[^\S\n]*$',
        include,
        path.read_text(),
        flags=re.MULTILINE,
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("build", type=Path, help="A completed Pico 2 RISC-V CMake build")
    args = parser.parse_args()
    build = args.build.resolve()
    output = Path(__file__).resolve().parents[1] / "site/pico2"
    driver, *options = shlex.split(
        (build / "CMakeFiles/trip_computer.dir/link.txt").read_text()
    )
    trace = subprocess.run(
        [driver, "-###", *options], cwd=build, check=True, capture_output=True, text=True
    ).stderr
    link = shlex.split(next(line for line in trace.splitlines() if "/collect2 " in line))
    if "-melf32lriscv" not in link:
        raise ValueError("Build trip_computer for rp2350-riscv first")

    # Make the SDK/runtime relocatable. Leave the lesson's main for the browser.
    objects = [arg for arg in link if arg.endswith(".o") and not arg.endswith("/trip.S.o")]
    wrappers = [arg for arg in link if arg.startswith("--wrap=")]
    search = [build / arg[2:] for arg in link if arg.startswith("-L")]
    libraries = link[link.index("-lstdc++"):link.index("-T")]
    ld = subprocess.check_output([driver, "-print-prog-name=ld"], text=True).strip()
    subprocess.run(
        [ld, "-melf32lriscv", "-r", "--strip-debug", *[f"-L{folder}" for folder in search],
         *wrappers, *objects, *libraries, "-o", output / "runtime.o"],
        cwd=build,
        check=True,
    )
    memory = next(arg.split("=", 1)[1] for arg in link if arg.startswith("--script="))
    layout = link[link.index("-T") + 1]
    script = "\n".join(linker_script(build / name, search) for name in (memory, layout))
    (output / "runtime.ld").write_text(script)


if __name__ == "__main__":
    main()
