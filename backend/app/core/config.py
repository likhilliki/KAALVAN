from typing import List, Union
import os
import platform
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "KAALVAN"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    DATABASE_URL: str = "sqlite:///./terraguard.db"
    
    # NASA FIRMS API Map Key
    NASA_FIRMS_MAP_KEY: str = ""
    FIRMS_API_KEY: str = ""
    
    # AI Inference Engine (Ensemble Risk Model on IBM LinuxONE)
    LLM_API_KEY: str = ""
    LLM_PROVIDER: str = "deterministic"  # Purely deterministic, grounded XAI (No external LLM required)
    
    # Open-Meteo APIs
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    OPEN_METEO_AIR_QUALITY_URL: str = "https://air-quality-api.open-meteo.com/v1"
    
    CACHE_TTL_SECONDS: int = 600
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,*"
    LINUXONE_TELEMETRY: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    @property
    def active_firms_key(self) -> str:
        return self.NASA_FIRMS_MAP_KEY or self.FIRMS_API_KEY or os.environ.get("FIRMS_API_KEY", "") or os.environ.get("NASA_FIRMS_MAP_KEY", "")

    @property
    def cors_origin_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_linuxone(self) -> bool:
        arch = platform.machine().lower()
        return "s390" in arch or "s390x" in arch or os.environ.get("IS_LINUXONE", "false").lower() == "true"


settings = Settings()
