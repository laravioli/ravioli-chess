from abc import ABC, abstractmethod
from urllib.parse import urljoin

import orjson
from jinja2 import Environment
from markupsafe import Markup

from .config import JinjaViteSettings


class JinjaViteApp(ABC):
    def __init__(self, settings: JinjaViteSettings):
        self.settings = settings

    @abstractmethod
    def vite_script(self, path: str, attrs: dict[str, str] | None = None) -> Markup: ...

    @abstractmethod
    def vite_stylesheet(self, path: str, attrs: dict[str, str] | None = None) -> Markup: ...

    @abstractmethod
    def vite_asset_url(self, path: str) -> Markup: ...

    def vite_hmr_client(self):
        return Markup("")

    def generate_script_tag(self, src: str, attrs: dict[str, str] | None = None):
        attrs_str = ""
        if attrs is not None:
            attrs_str = " ".join([f'{key}="{value}"' for key, value in attrs.items()])

        return f'<script {attrs_str} src="{src}"></script>'

    def generate_stylesheet_tag(self, href: str):
        return f'<link rel="stylesheet" href="{href}" />'


class DevApp(JinjaViteApp):
    def _get_dev_server_url(self, path: str):
        protocol = self.settings.VITE_SERVER_PROTOCOL
        host = self.settings.VITE_SERVER_HOST
        port = self.settings.VITE_SERVER_PORT

        base_url = f"{protocol}://{host}:{port}/"
        base_path = self.settings.STATIC_URL + self.settings.URL_SCOPE_PREFIX

        return urljoin(base_url, urljoin(base_path, path))

    def vite_script(self, path: str, attrs: dict[str, str] | None = None) -> Markup:
        src = self._get_dev_server_url(path)
        return Markup(self.generate_script_tag(src=src, attrs=attrs))

    def vite_stylesheet(self, path: str) -> Markup:
        href = self._get_dev_server_url(path)
        return Markup(self.generate_stylesheet_tag(href))

    def vite_asset_url(self, path: str) -> Markup:
        return Markup(self._get_dev_server_url(path))

    def vite_hmr_client(self):
        react_url = self._get_dev_server_url(path=self.settings.REACT_REFRESH_URL)
        react_script = f"""<script type="module">
            import RefreshRuntime from '{react_url}'
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {{}}
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
        </script>"""

        ws_url = self._get_dev_server_url(path=self.settings.WS_CLIENT_URL)
        ws_script = self.generate_script_tag(ws_url, {"type": "module"})

        return Markup("\n".join((react_script, ws_script)))


class ProdApp(JinjaViteApp):
    def _parse_manifest(self):
        manifest_path = self.settings.MANIFEST_PATH
        with open(manifest_path) as manifest_file:
            content = manifest_file.read()
        try:
            self.manifest = orjson.loads(content)
        except Exception:
            raise RuntimeError(f"Cannot read Vite manifest file at {manifest_path}")

    def vite_script(self, path: str, attrs: dict[str, str] | None = None) -> Markup:
        pass

    def vite_stylesheet(self, path: str) -> Markup:
        pass

    def vite_asset_url(self, path: str) -> Markup:
        pass


def add_jinja_vite_globals(env: Environment, settings: JinjaViteSettings | None = None):
    if not settings:
        settings = JinjaViteSettings()

    if settings.ENVIRONMENT == "local":
        jinja_vite = DevApp(settings=settings)
    else:
        jinja_vite = ProdApp(settings=settings)

    env.globals["vite_script"] = jinja_vite.vite_script
    env.globals["vite_stylesheet"] = jinja_vite.vite_stylesheet
    env.globals["vite_asset_url"] = jinja_vite.vite_asset_url
    env.globals["vite_hmr_client"] = jinja_vite.vite_hmr_client
