"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export type TabItem =
  | {
      label: string;
      icon: LucideIcon;
      type: "tab";
    }
  | {
      type: "separator";
    };

interface ExpandableTabsProps {
  tabs: TabItem[];
  activeIndex: number | null;
  onChange: (index: number) => void;
  className?: string;
  activeColor?: string;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  activeIndex,
  onChange,
  className,
  activeColor = "text-primary",
}: ExpandableTabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background p-1 shadow-sm",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return (
            <div
              key={`separator-${index}`}
              className="mx-1 h-[24px] w-[1.2px] bg-border"
              aria-hidden="true"
            />
          );
        }

        return (
          <motion.button
            key={index}
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            custom={activeIndex === index}
            onClick={() => onChange(index)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-300 flex-shrink-0",
              activeIndex === index
                ? cn("bg-muted", activeColor)
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <tab.icon size={18} />
            <AnimatePresence initial={false}>
              {activeIndex === index && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap ml-2"
                >
                  {tab.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
