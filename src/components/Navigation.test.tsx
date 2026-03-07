import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Navigation } from "./Navigation";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const mockUseSession = useSession as ReturnType<typeof vi.fn>;
const mockUsePathname = usePathname as ReturnType<typeof vi.fn>;

describe("Navigation", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  describe("Drawer functionality", () => {
    it("should not show drawer by default", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Navigation />);

      expect(screen.queryByRole("dialog")).toBeFalsy();
    });

    it("should open drawer when hamburger button is clicked", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(hamburgerButton);

      expect(screen.getByText("Panels")).toBeTruthy();
    });

    it("should close drawer when close button is clicked", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(hamburgerButton);

      const closeButton = screen.getByLabelText("Close navigation menu");
      fireEvent.click(closeButton);

      expect(screen.queryByLabelText("Close navigation menu")).toBeFalsy();
    });

    it("should close drawer when overlay is clicked", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(hamburgerButton);

      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(screen.queryByLabelText("Close navigation menu")).toBeFalsy();
    });

    it("should close drawer on Escape key", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(hamburgerButton);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(screen.queryByLabelText("Close navigation menu")).toBeFalsy();
    });
  });

  describe("Dropdown functionality", () => {
    it("should not show panel dropdown for regular users", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "user@test.com",
            role: "READER",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      expect(screen.queryByText("Panel")).toBeFalsy();
    });

    it("should show panel dropdown for creator users", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "creator@test.com",
            role: "CREATOR",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      expect(screen.getByText("Panel")).toBeTruthy();
    });

    it("should open dropdown when clicked", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "creator@test.com",
            role: "CREATOR",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      const panelButton = screen.getByText("Panel").closest("button");
      if (panelButton) {
        fireEvent.click(panelButton);
      }

      expect(screen.getByText("Creator Panel")).toBeTruthy();
    });

    it("should close dropdown on Escape key", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "creator@test.com",
            role: "CREATOR",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      const panelButton = screen.getByText("Panel").closest("button");
      if (panelButton) {
        fireEvent.click(panelButton);
      }

      fireEvent.keyDown(document, { key: "Escape" });

      expect(screen.queryByText("Creator Panel")).toBeFalsy();
    });
  });

  describe("Role-based visibility", () => {
    it("should show only Creator Panel for CREATOR role", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "creator@test.com",
            role: "CREATOR",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      const panelButton = screen.getByText("Panel").closest("button");
      if (panelButton) {
        fireEvent.click(panelButton);
      }

      expect(screen.getByText("Creator Panel")).toBeTruthy();
      expect(screen.queryByText("Admin Panel")).toBeFalsy();
    });

    it("should show both Creator and Admin Panel for ADMIN role", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "admin@test.com",
            role: "ADMIN",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      const panelButton = screen.getByText("Panel").closest("button");
      if (panelButton) {
        fireEvent.click(panelButton);
      }

      expect(screen.getByText("Creator Panel")).toBeTruthy();
      expect(screen.getByText("Admin Panel")).toBeTruthy();
    });

    it("should not show panel dropdown for READER role", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "reader@test.com",
            role: "READER",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      expect(screen.queryByText("Panel")).toBeFalsy();
    });
  });

  describe("Responsive behavior", () => {
    it("should show hamburger button on mobile/tablet", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Navigation />);

      expect(screen.getByLabelText("Toggle navigation menu")).toBeTruthy();
    });

    it("should hide desktop navigation links in drawer", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "user@test.com",
            role: "READER",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(hamburgerButton);

      const drawer = screen.getAllByText("Perfil");
      expect(drawer.length).toBeGreaterThan(0);
    });
  });

  describe("Navigation item visibility based on auth status", () => {
    it("should show login button when unauthenticated", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Navigation />);

      expect(screen.getByText("Ingresar")).toBeTruthy();
    });

    it("should show profile and sign out when authenticated", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "user@test.com",
            role: "READER",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      expect(screen.getByText("Perfil")).toBeTruthy();
      expect(screen.getByText("Cerrar sesión")).toBeTruthy();
    });

    it("should show loading state when session is loading", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<Navigation />);

      const loadingElement = document.querySelector(".animate-pulse");
      expect(loadingElement).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("should have aria-expanded attribute on hamburger button", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText("Toggle navigation menu");
      expect(hamburgerButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(hamburgerButton);
      expect(hamburgerButton).toHaveAttribute("aria-expanded", "true");
    });

    it("should have aria-controls attribute on hamburger button", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<Navigation />);

      const hamburgerButton = screen.getByLabelText("Toggle navigation menu");
      expect(hamburgerButton).toHaveAttribute("aria-controls", "mobile-drawer");
    });

    it("should have aria-expanded attribute on panel dropdown", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "creator@test.com",
            role: "CREATOR",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      const panelButton = screen.getByText("Panel").closest("button");
      expect(panelButton).toHaveAttribute("aria-expanded", "false");

      if (panelButton) {
        fireEvent.click(panelButton);
        expect(panelButton).toHaveAttribute("aria-expanded", "true");
      }
    });

    it("should have aria-haspopup attribute on panel dropdown", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            email: "creator@test.com",
            role: "CREATOR",
          },
        },
        status: "authenticated",
      });

      render(<Navigation />);

      const panelButton = screen.getByText("Panel").closest("button");
      expect(panelButton).toHaveAttribute("aria-haspopup", "true");
    });
  });
});
