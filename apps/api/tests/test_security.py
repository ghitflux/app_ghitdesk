"""Test security utilities"""
import pytest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


def test_hash_password():
    """Test password hashing"""
    password = "mypassword123"
    hashed = hash_password(password)

    assert hashed != password
    assert len(hashed) > 0
    assert hashed.startswith("$2b$")  # bcrypt prefix


def test_verify_password():
    """Test password verification"""
    password = "mypassword123"
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_create_access_token():
    """Test JWT access token creation"""
    data = {"sub": "user123", "email": "test@example.com"}
    token = create_access_token(data)

    assert len(token) > 0
    assert isinstance(token, str)
    assert "." in token  # JWT has dots


def test_create_refresh_token():
    """Test JWT refresh token creation"""
    data = {"sub": "user123"}
    token = create_refresh_token(data)

    assert len(token) > 0
    assert isinstance(token, str)


def test_decode_token():
    """Test JWT token decoding"""
    data = {"sub": "user123", "email": "test@example.com"}
    token = create_access_token(data)

    decoded = decode_token(token)

    assert decoded["sub"] == "user123"
    assert decoded["email"] == "test@example.com"
    assert "exp" in decoded
    assert decoded["type"] == "access"


def test_access_vs_refresh_token():
    """Test difference between access and refresh tokens"""
    data = {"sub": "user123"}

    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)

    access_decoded = decode_token(access_token)
    refresh_decoded = decode_token(refresh_token)

    assert access_decoded["type"] == "access"
    assert refresh_decoded["type"] == "refresh"
    # Refresh token should expire later
    assert refresh_decoded["exp"] > access_decoded["exp"]
