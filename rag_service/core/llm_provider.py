"""
core/llm_provider.py
--------------------
Unified interface for LLM completion requests.

Implements sequential fallback routing:
  1. Claude (Anthropic) - Default
  2. OpenAI (GPT) - Secondary fallback (if key configured)
  3. Gemini (Google) - Final fallback

Handles rate limit, connection, and API errors gracefully, falling back to the next available provider.
"""

import traceback
from typing import Optional
from logger import get_logger
from config import (
    ANTHROPIC_API_KEY,
    CLAUDE_MODEL,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    GEMINI_API_KEY,
    GEMINI_MODEL,
)

logger = get_logger(__name__)

# Cache provider model instances/clients
_anthropic_client = None
_openai_client = None
_gemini_model = None


def _get_anthropic_client():
    """Lazily initialize Anthropic client."""
    global _anthropic_client
    if _anthropic_client is None and ANTHROPIC_API_KEY:
        try:
            import anthropic
            _anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            logger.info("Anthropic client initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize Anthropic client: {e}")
    return _anthropic_client


def _get_openai_client():
    """Lazily initialize OpenAI client."""
    global _openai_client
    if _openai_client is None and OPENAI_API_KEY:
        try:
            import openai
            _openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
            logger.info("OpenAI client initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
    return _openai_client


def _get_gemini_model():
    """Lazily initialize Gemini model."""
    global _gemini_model
    if _gemini_model is None and GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            from google.generativeai.types import HarmCategory, HarmBlockThreshold
            genai.configure(api_key=GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel(
                model_name=GEMINI_MODEL,
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HARASSMENT:        HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH:       HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                },
            )
            logger.info(f"Gemini model initialized: {GEMINI_MODEL}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
    return _gemini_model


def _call_claude(system_prompt: str, user_prompt: str, max_tokens: int) -> Optional[str]:
    """Call Claude model."""
    client = _get_anthropic_client()
    if not client:
        raise ValueError("Claude API key not configured or client initialization failed.")

    logger.info(f"Calling Claude default model ({CLAUDE_MODEL})...")
    message = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=max_tokens,
        system=system_prompt,
        temperature=0.3,
        messages=[
            {"role": "user", "content": user_prompt}
        ]
    )

    if not message.content or not message.content[0].text:
        raise ValueError("Claude returned an empty response.")
    
    return message.content[0].text.strip()


def _call_openai(system_prompt: str, user_prompt: str, max_tokens: int) -> Optional[str]:
    """Call OpenAI model."""
    client = _get_openai_client()
    if not client:
        raise ValueError("OpenAI API key not configured or client initialization failed.")

    logger.info(f"Calling OpenAI fallback model ({OPENAI_MODEL})...")
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        max_tokens=max_tokens,
        temperature=0.3,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )

    if not response.choices or not response.choices[0].message.content:
        raise ValueError("OpenAI returned an empty response.")
    
    return response.choices[0].message.content.strip()


def _call_gemini(system_prompt: str, user_prompt: str, max_tokens: int) -> Optional[str]:
    """Call Gemini model."""
    model = _get_gemini_model()
    if not model:
        raise ValueError("Gemini API key not configured or client initialization failed.")

    import google.generativeai as genai
    logger.info(f"Calling Gemini fallback model ({GEMINI_MODEL})...")
    response = model.generate_content(
        f"{system_prompt}\n\n{user_prompt}",
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=0.3,
        ),
    )

    if not response.candidates:
        raise ValueError("Gemini returned no candidates (blocked by safety or query issue).")

    text = response.text
    if not text:
        raise ValueError("Gemini returned an empty response.")
    
    return text.strip()


def call_llm(system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> str:
    """
    Unified LLM calling interface with Claude -> OpenAI -> Gemini fallback hierarchy.
    """
    errors = []

    # Step 1: Default to Claude
    try:
        if ANTHROPIC_API_KEY:
            return _call_claude(system_prompt, user_prompt, max_tokens)
        else:
            errors.append("Claude skipped: ANTHROPIC_API_KEY is missing.")
    except Exception as e:
        err_msg = f"Claude call failed: {str(e)}"
        logger.warning(err_msg)
        errors.append(err_msg)

    # Step 2: Fallback to OpenAI
    try:
        if OPENAI_API_KEY:
            return _call_openai(system_prompt, user_prompt, max_tokens)
        else:
            errors.append("OpenAI fallback skipped: OPENAI_API_KEY is missing.")
    except Exception as e:
        err_msg = f"OpenAI fallback failed: {str(e)}"
        logger.warning(err_msg)
        errors.append(err_msg)

    # Step 3: Fallback to Gemini
    try:
        if GEMINI_API_KEY:
            return _call_gemini(system_prompt, user_prompt, max_tokens)
        else:
            errors.append("Gemini fallback skipped: GEMINI_API_KEY is missing.")
    except Exception as e:
        err_msg = f"Gemini fallback failed: {str(e)}"
        logger.warning(err_msg)
        errors.append(err_msg)

    # If all options failed
    all_errors = "\n".join(errors)
    logger.critical(f"All LLM providers failed to generate content.\nErrors:\n{all_errors}")
    raise RuntimeError(f"All LLM providers failed. Details:\n{all_errors}")
