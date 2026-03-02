from abc import ABC, abstractmethod
from urllib.parse import urljoin

import orjson
from jinja2 import Environment
from markupsafe import Markup

from .config import JinjaViteConfig


class JinjaViteApp(ABC):
    def __init__(self, config: JinjaViteConfig):
        self.config = config

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
    @property
    def base_url(self):
        return f"{self.config.VITE_DEV_PROTOCOL}://{self.config.VITE_DEV_HOST}:{self.config.VITE_DEV_PORT}/"

    def get_url(self, path: str):
        return urljoin(self.base_url, urljoin(self.config.STATIC_URL, path))

    def vite_script(self, path: str, attrs: dict[str, str] | None = None) -> Markup:
        return Markup(self.generate_script_tag(src=self.get_url(path), attrs=attrs))

    def vite_stylesheet(self, path: str) -> Markup:
        return Markup(self.generate_stylesheet_tag(href=self.get_url(path)))

    def vite_asset_url(self, path: str) -> Markup:
        return Markup(self.get_url(path))

    def vite_hmr_client(self):
        react_script = f"""<script type="module">
            import RefreshRuntime from '{self.get_url(self.config.REACT_REFRESH_URL)}'
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {{}}
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
        </script>"""

        ws_script = self.generate_script_tag(
            src=self.get_url(self.config.WS_CLIENT_URL), attrs={"type": "module"}
        )

        return Markup("\n        ".join((react_script, ws_script)))


class ProdApp(JinjaViteApp):
    def _parse_manifest(self):
        manifest_path = self.config.MANIFEST_PATH
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


def add_jinja_vite_globals(env: Environment, config: JinjaViteConfig | None = None):
    if not config:
        config = JinjaViteConfig()

    if config.ENVIRONMENT == "local":
        jinja_vite = DevApp(config)
    else:
        jinja_vite = ProdApp(config)

    env.globals["vite_script"] = jinja_vite.vite_script
    env.globals["vite_stylesheet"] = jinja_vite.vite_stylesheet
    env.globals["vite_asset_url"] = jinja_vite.vite_asset_url
    env.globals["vite_hmr_client"] = jinja_vite.vite_hmr_client
