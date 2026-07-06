#!/usr/bin/env bash
# Compiles the app's pure, platform-independent core (problem generator,
# tutorial plans, practice state machine, statistics, rewards, time limit)
# together with all five XCTest suites, and runs them — on Linux, with any
# Swift ≥ 5.8 toolchain. This is the same logic the iOS app ships; the
# SwiftUI/SwiftData layer on top is exercised by `./run.sh test` on macOS.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="${TMPDIR:-/tmp}/matematyka-tosi-core-tests"
rm -rf "$BUILD"
mkdir -p "$BUILD"

TRIPLE_FLAG=""
if [ "$(uname -s)" = "Linux" ]; then
  TRIPLE_FLAG="-target $(uname -m)-unknown-linux-gnu"
fi

CORE_FILES=()
for f in MathCore ProblemGenerator PraiseBank TrophyLadder \
         StatisticsAggregator TimeLimitEngine TutorialPlan PracticeCore; do
  CORE_FILES+=("$REPO/MatematykaTosi/Core/$f.swift")
done
TEST_FILES=("$REPO"/MatematykaTosiTests/*.swift)

# 1. Build the core as a testable library.
# shellcheck disable=SC2086
swiftc $TRIPLE_FLAG -swift-version 5 -enable-testing \
  -emit-library -emit-module -module-name MatematykaTosi \
  -emit-module-path "$BUILD/MatematykaTosi.swiftmodule" \
  "${CORE_FILES[@]}" -o "$BUILD/libMatematykaTosi.so"

# 2. Generate the XCTest main runner (Linux XCTest has no discovery).
python3 - "$BUILD/main.swift" "${TEST_FILES[@]}" <<'PY'
import re, sys
out, files = sys.argv[1], sys.argv[2:]
classes = {}
for path in files:
    src = open(path).read()
    for cm in re.finditer(r'class\s+(\w+)\s*:\s*XCTestCase\s*\{', src):
        classes[cm.group(1)] = re.findall(r'func\s+(test\w+)\s*\(', src[cm.end():])
lines = ["import XCTest", "@testable import MatematykaTosi", ""]
for cls, tests in classes.items():
    lines.append(f"extension {cls} {{")
    lines.append("    static var allGeneratedTests = [")
    lines += [f'        ("{t}", {t}),' for t in tests]
    lines.append("    ]")
    lines.append("}")
    lines.append("")
lines.append("XCTMain([")
lines += [f"    testCase({cls}.allGeneratedTests)," for cls in classes]
lines.append("])")
open(out, "w").write("\n".join(lines) + "\n")
print(f"suites: {len(classes)}, tests: {sum(len(v) for v in classes.values())}")
PY

# 3. Build and run the tests.
# shellcheck disable=SC2086
swiftc $TRIPLE_FLAG -swift-version 5 \
  "${TEST_FILES[@]}" "$BUILD/main.swift" \
  -I "$BUILD" -L "$BUILD" -lMatematykaTosi \
  -o "$BUILD/run-tests"
LD_LIBRARY_PATH="$BUILD" "$BUILD/run-tests"
