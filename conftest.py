import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
import importlib

# Add services root directory to sys.path
root_dir = Path(__file__).parent
services_dir = root_dir / "services"

if services_dir.exists():
    for service_path in services_dir.iterdir():
        if service_path.is_dir():
            sys.path.insert(0, str(service_path))


@pytest.fixture(scope="module")
def client(request):
    """Dynamically imports app.main for the microservice under test."""
    test_file_path = Path(request.module.__file__)
    # Resolve target service folder: services/<service_name>
    service_dir = test_file_path.parent.parent

    # Push targeted service directory to front of path
    sys.path.insert(0, str(service_dir))

    # Unload cached app module to prevent service cross-contamination
    for mod in list(sys.modules.keys()):
        if mod == "app" or mod.startswith("app."):
            del sys.modules[mod]

    main_module = importlib.import_module("app.main")

    with TestClient(main_module.app) as test_client:
        yield test_client