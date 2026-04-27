"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Shepherd from "shepherd.js";

const TOUR_STORAGE_KEY = "doit-product-tour-v1";
const TOUR_PENDING_KEY = "doit-product-tour-pending";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function waitForSelector(selector: string, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const node = document.querySelector(selector);
    if (node) return node;
    await delay(120);
  }
  return null;
}

export function ProductTour() {
  const pathname = usePathname();
  const tourRef = useRef<Shepherd.Tour | null>(null);
  const autoStartedRef = useRef(false);

  const startTour = useCallback(
    (force = false) => {
      if (!pathname.startsWith("/tasks")) return;
      if (tourRef.current?.isActive()) return;
      if (!force && localStorage.getItem(TOUR_STORAGE_KEY) === "done") return;

      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: "doit-tour-step",
          cancelIcon: { enabled: true },
          scrollTo: { behavior: "smooth", block: "center" },
        },
      });

      const baseButtons = [
        {
          text: "Back",
          action: () => tour.back(),
          classes: "shepherd-button-secondary",
        },
        {
          text: "Next",
          action: () => tour.next(),
          classes: "shepherd-button-primary",
        },
      ];

      tour.addStep({
        id: "create-page",
        title: "Create Task Pages",
        text: "Use this + button to create a fresh task page instantly. Your AI plans can create full pages here too.",
        attachTo: { element: '[data-tour="create-task-page"]', on: "right" },
        buttons: [baseButtons[1]],
      });

      tour.addStep({
        id: "ai-entry",
        title: "Open AI Planner",
        text: "This is your AI command center. Start here when you want tasks generated from a goal.",
        attachTo: { element: '[data-tour="ai-open-planner"]', on: "right" },
        buttons: baseButtons,
      });

      tour.addStep({
        id: "ai-prompt",
        title: "Write Better Prompts",
        text: "Include your goal, time window, and constraints. The built-in examples help you format high-quality prompts quickly.",
        beforeShowPromise: async () => {
          const trigger = document.querySelector(
            '[data-tour="ai-open-planner"]',
          ) as HTMLButtonElement | null;
          if (
            trigger &&
            !document.querySelector('[data-tour="ai-prompt-input"]')
          ) {
            trigger.click();
            await delay(280);
          }
        },
        attachTo: { element: '[data-tour="ai-prompt-input"]', on: "left" },
        buttons: baseButtons,
      });

      tour.addStep({
        id: "ai-generate",
        title: "Generate Then Convert",
        text: "Generate a plan first, review the suggested tasks, then convert them directly into your task page.",
        attachTo: { element: '[data-tour="ai-generate-plan"]', on: "left" },
        buttons: baseButtons,
      });

      tour.addStep({
        id: "new-task",
        title: "Manual Task Creation",
        text: "Prefer manual entry? Add title, due date, and priority here. Then click Add Task.",
        beforeShowPromise: async () => {
          const closeButton = document.querySelector(
            '[data-slot="dialog-close"]',
          ) as HTMLButtonElement | null;
          if (closeButton) {
            closeButton.click();
            await delay(220);
          }

          const hasNewTaskInput = document.querySelector(
            '[data-tour="new-task-input"]',
          );
          if (!hasNewTaskInput) {
            const createPageButton = document.querySelector(
              '[data-tour="create-task-page"]',
            ) as HTMLButtonElement | null;
            if (createPageButton) {
              createPageButton.click();
              await waitForSelector('[data-tour="new-task-input"]', 7000);
            }
          }
        },
        attachTo: { element: '[data-tour="new-task-input"]', on: "bottom" },
        buttons: baseButtons,
      });

      tour.addStep({
        id: "finish",
        title: "You Are Ready",
        text: "Create pages, generate AI plans, and add tasks in seconds. You can restart this tour anytime from the sidebar.",
        attachTo: { element: '[data-tour="add-task-button"]', on: "bottom" },
        buttons: [
          {
            text: "Back",
            action: () => tour.back(),
            classes: "shepherd-button-secondary",
          },
          {
            text: "Done",
            action: () => tour.complete(),
            classes: "shepherd-button-primary",
          },
        ],
      });

      const markDone = () => {
        localStorage.setItem(TOUR_STORAGE_KEY, "done");
        tourRef.current = null;
      };

      tour.on("complete", markDone);
      tour.on("cancel", markDone);

      tourRef.current = tour;
      tour.start();
    },
    [pathname],
  );

  useEffect(() => {
    if (!pathname.startsWith("/tasks")) return;
    const pending = sessionStorage.getItem(TOUR_PENDING_KEY) === "1";
    if (pending) {
      sessionStorage.removeItem(TOUR_PENDING_KEY);
      const timer = setTimeout(() => startTour(true), 420);
      return () => clearTimeout(timer);
    }

    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    const timer = setTimeout(() => startTour(false), 420);
    return () => clearTimeout(timer);
  }, [pathname, startTour]);

  useEffect(() => {
    const handleStartTour = () => {
      if (!pathname.startsWith("/tasks")) {
        sessionStorage.setItem(TOUR_PENDING_KEY, "1");
        return;
      }
      startTour(true);
    };
    window.addEventListener("doit:start-tour", handleStartTour);
    return () => window.removeEventListener("doit:start-tour", handleStartTour);
  }, [pathname, startTour]);

  return null;
}
