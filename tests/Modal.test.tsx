import { expect, test, describe, beforeEach, afterEach } from "@rstest/core";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Modal from "../src/components/Modal";

describe("Modal accessibility", () => {
  let originalActiveElement: Element | null;

  beforeEach(() => {
    originalActiveElement = document.activeElement;
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("should have role dialog and aria-modal", () => {
    render(
      <Modal visible={true}>
        <button>Focusable</button>
      </Modal>,
    );

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
  });

  test("should focus first focusable element when opened", async () => {
    render(
      <Modal visible={true}>
        <button data-testid="first-btn">First</button>
        <button>Second</button>
      </Modal>,
    );

    await waitFor(() => {
      const firstBtn = screen.getByTestId("first-btn");
      expect(document.activeElement).toBe(firstBtn);
    });
  });

  test("should trap tab navigation within modal", async () => {
    render(
      <Modal visible={true}>
        <button data-testid="first">First</button>
        <button data-testid="last">Last</button>
      </Modal>,
    );

    const firstBtn = screen.getByTestId("first");
    const lastBtn = screen.getByTestId("last");

    lastBtn.focus();
    fireEvent.keyDown(document, { key: "Tab" });

    await waitFor(() => {
      expect(document.activeElement).toBe(firstBtn);
    });
  });

  test("should restore focus on close", async () => {
    const trigger = document.createElement("button");
    trigger.id = "trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <Modal visible={true}>
        <button>Inside</button>
      </Modal>,
    );

    rerender(
      <Modal visible={false}>
        <button>Inside</button>
      </Modal>,
    );

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });

    document.body.removeChild(trigger);
  });

  test("should close on escape key", () => {
    let called = false;
    const mockClose = () => {
      called = true;
    };

    render(
      <Modal visible={true} onClose={mockClose}>
        <button>Inside</button>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(called).toBe(true);
  });
});
