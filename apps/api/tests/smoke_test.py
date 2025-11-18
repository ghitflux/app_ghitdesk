#!/usr/bin/env python3
"""
Smoke tests for GhitDesk API - Multi-Tenancy

This script performs end-to-end smoke tests to validate:
1. API is running and healthy
2. Both tenants can authenticate
3. Data isolation is working
4. All major endpoints are functional
"""
import requests
import sys
from typing import Dict, Any

API_URL = "http://localhost:8000"

# ANSI color codes
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'


class SmokeTest:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.tests_passed = 0
        self.tests_failed = 0
        self.tenant1_session = requests.Session()
        self.tenant2_session = requests.Session()

    def log(self, message: str, color: str = Colors.RESET):
        print(f"{color}{message}{Colors.RESET}")

    def test(self, name: str, fn):
        """Run a test function and track results"""
        self.log(f"\n▶ Testing: {name}", Colors.YELLOW)
        try:
            fn()
            self.log(f"  ✓ PASSED", Colors.GREEN)
            self.tests_passed += 1
        except AssertionError as e:
            self.log(f"  ✗ FAILED: {str(e)}", Colors.RED)
            self.tests_failed += 1
        except Exception as e:
            self.log(f"  ✗ ERROR: {str(e)}", Colors.RED)
            self.tests_failed += 1

    def test_health(self):
        """Test API health check"""
        response = self.tenant1_session.get(f"{self.base_url}/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["status"] == "ok", "Health check status should be 'ok'"
        self.log(f"    API Version: {data.get('version', 'unknown')}")

    def test_login_tenant1(self):
        """Test login for Tenant 1 (Acme Corporation)"""
        response = self.tenant1_session.post(
            f"{self.base_url}/auth/login",
            json={
                "email": "admin@acmecorporation.com",
                "password": "admin123"
            }
        )
        assert response.status_code == 200, f"Login failed with status {response.status_code}"
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        self.log(f"    Logged in as: admin@acmecorporation.com")

    def test_login_tenant2(self):
        """Test login for Tenant 2 (TechStart Inc)"""
        response = self.tenant2_session.post(
            f"{self.base_url}/auth/login",
            json={
                "email": "admin@techstartinc.com",
                "password": "admin123"
            }
        )
        assert response.status_code == 200, f"Login failed with status {response.status_code}"
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        self.log(f"    Logged in as: admin@techstartinc.com")

    def test_fetch_tickets_tenant1(self):
        """Test fetching tickets for Tenant 1"""
        response = self.tenant1_session.get(f"{self.base_url}/tickets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "tickets" in data, "Response should contain 'tickets' key"
        assert "total" in data, "Response should contain 'total' key"
        self.log(f"    Tenant 1 has {data['total']} tickets")

        # Verify ticket numbers start with tenant prefix
        if data['tickets']:
            first_ticket = data['tickets'][0]['ticket_number']
            assert first_ticket.startswith("ACME-"), f"Ticket should start with ACME-, got {first_ticket}"
            self.log(f"    Sample ticket: {first_ticket}")

    def test_fetch_tickets_tenant2(self):
        """Test fetching tickets for Tenant 2"""
        response = self.tenant2_session.get(f"{self.base_url}/tickets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "tickets" in data, "Response should contain 'tickets' key"
        self.log(f"    Tenant 2 has {data['total']} tickets")

        # Verify ticket numbers start with tenant prefix
        if data['tickets']:
            first_ticket = data['tickets'][0]['ticket_number']
            assert first_ticket.startswith("TECHSTART-"), f"Ticket should start with TECHSTART-, got {first_ticket}"
            self.log(f"    Sample ticket: {first_ticket}")

    def test_data_isolation(self):
        """Test that tenants see different data"""
        resp1 = self.tenant1_session.get(f"{self.base_url}/tickets")
        resp2 = self.tenant2_session.get(f"{self.base_url}/tickets")

        data1 = resp1.json()
        data2 = resp2.json()

        # Get ticket IDs from both tenants
        ids1 = {t['id'] for t in data1.get('tickets', [])}
        ids2 = {t['id'] for t in data2.get('tickets', [])}

        # IDs should not overlap
        overlap = ids1 & ids2
        assert len(overlap) == 0, f"Found {len(overlap)} overlapping ticket IDs between tenants!"
        self.log(f"    ✓ No data overlap between tenants")

    def test_conversations_isolation(self):
        """Test conversation isolation"""
        resp1 = self.tenant1_session.get(f"{self.base_url}/conversations")
        resp2 = self.tenant2_session.get(f"{self.base_url}/conversations")

        assert resp1.status_code == 200
        assert resp2.status_code == 200

        data1 = resp1.json()
        data2 = resp2.json()

        self.log(f"    Tenant 1: {data1['total']} conversations")
        self.log(f"    Tenant 2: {data2['total']} conversations")

        # Verify no overlap in conversation IDs
        ids1 = {c['id'] for c in data1.get('conversations', [])}
        ids2 = {c['id'] for c in data2.get('conversations', [])}
        overlap = ids1 & ids2

        assert len(overlap) == 0, f"Found overlapping conversation IDs!"

    def test_logout(self):
        """Test logout"""
        response = self.tenant1_session.post(f"{self.base_url}/auth/logout")
        assert response.status_code == 200, f"Logout failed with status {response.status_code}"
        self.log(f"    Successfully logged out")

    def run_all_tests(self):
        """Run all smoke tests"""
        self.log("=" * 60, Colors.BLUE)
        self.log("🚀 GHITDESK API SMOKE TESTS - MULTI-TENANCY", Colors.BLUE)
        self.log("=" * 60, Colors.BLUE)

        # Test sequence
        self.test("API Health Check", self.test_health)
        self.test("Tenant 1 Login (Acme)", self.test_login_tenant1)
        self.test("Tenant 2 Login (TechStart)", self.test_login_tenant2)
        self.test("Fetch Tickets - Tenant 1", self.test_fetch_tickets_tenant1)
        self.test("Fetch Tickets - Tenant 2", self.test_fetch_tickets_tenant2)
        self.test("Verify Data Isolation", self.test_data_isolation)
        self.test("Verify Conversations Isolation", self.test_conversations_isolation)
        self.test("Logout", self.test_logout)

        # Summary
        self.log("\n" + "=" * 60, Colors.BLUE)
        self.log("📊 TEST SUMMARY", Colors.BLUE)
        self.log("=" * 60, Colors.BLUE)
        self.log(f"Tests Passed: {self.tests_passed}", Colors.GREEN)
        self.log(f"Tests Failed: {self.tests_failed}", Colors.RED)

        if self.tests_failed == 0:
            self.log("\n🎉 ALL SMOKE TESTS PASSED!", Colors.GREEN)
            self.log("Multi-tenancy is working correctly.", Colors.GREEN)
            return 0
        else:
            self.log("\n❌ SOME TESTS FAILED", Colors.RED)
            self.log("Please review the failures above.", Colors.RED)
            return 1


if __name__ == "__main__":
    print("\nStarting smoke tests...")
    print(f"API URL: {API_URL}\n")

    tester = SmokeTest(API_URL)
    exit_code = tester.run_all_tests()

    sys.exit(exit_code)
