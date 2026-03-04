import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

// A simple component that throws to test ErrorBoundary
const Bomb = () => {
  throw new Error("boom");
  return null;
};

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(<ErrorBoundary><div>Child</div></ErrorBoundary>);
    expect(screen.getByText("Child")).toBeTruthy();
  });

  it("catches errors and renders fallback UI", () => {
    // Rendering a component that throws will trigger ErrorBoundary
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    // Fallback UI includes the generic error heading and a retry button
    expect(screen.getByText(/Error en la aplicación/i)).toBeTruthy();
    expect(screen.getByText(/Reintentar/i)).toBeTruthy();
  });
});
