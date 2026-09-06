"""Loads the hyphenated .github/scripts/*.py files as importable modules.

They are standalone CLI scripts (not a package, filenames use hyphens), so
they can't be `import`ed normally -- load each by file path instead.
"""
import importlib.util
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent.parent


def load_module(script_name, module_name):
    spec = importlib.util.spec_from_file_location(module_name, SCRIPTS_DIR / script_name)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module
