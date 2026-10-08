#!/usr/bin/env python3
"""Builds the single-file app: inlines jsPDF into src/app.html -> EndoLetter.html"""
import pathlib, sys
here = pathlib.Path(__file__).parent
src = (here / 'src' / 'app.html').read_text()
lib = pathlib.Path(sys.argv[1]).read_text()
assert '/*__JSPDF__*/' in src
out = src.replace('<script>/*__JSPDF__*/</script>', '<script>\n' + lib.replace('</script', '<\\/script') + '\n</script>', 1)
(here / 'EndoLetter.html').write_text(out)
print('built', len(out), 'bytes')
