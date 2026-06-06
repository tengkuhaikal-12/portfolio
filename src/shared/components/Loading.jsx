"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const loadingWords = ["Loading", "Syncing", "Rendering", "Preparing", "Almost Ready"];
const MotionDiv = motion.div;
const MotionP = motion.p;

const screenMotion = {
    initial: { y: 0 },
    exit: {
        y: "-100%",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
    },
};

const panelMotion = {
    initial: { opacity: 0, y: 18 },
    enter: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
};

const wordMotion = {
    initial: { opacity: 0, y: 10 },
    enter: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function Loading({ onComplete }) {
    const [index, setIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (onComplete) return undefined;

        const interval = setInterval(() => {
            setIndex((current) => (current + 1) % loadingWords.length);
        }, 650);

        return () => clearInterval(interval);
    }, [onComplete]);

    useEffect(() => {
        if (!onComplete) return undefined;

        if (index === loadingWords.length - 1) {
            const exitTimer = setTimeout(() => setIsExiting(true), 650);
            const completeTimer = setTimeout(() => onComplete?.(), 1450);

            return () => {
                clearTimeout(exitTimer);
                clearTimeout(completeTimer);
            };
        }

        const timer = setTimeout(
            () => {
                setIndex((current) => current + 1);
            },
            index === 0 ? 850 : 260
        );

        return () => clearTimeout(timer);
    }, [index, onComplete]);

    return (
        <MotionDiv
            variants={screenMotion}
            initial="initial"
            animate={isExiting ? "exit" : "initial"}
            className="fixed inset-0 z-[99999999999] flex min-h-screen w-screen items-center justify-center overflow-hidden bg-[var(--color-paper)] bg-[linear-gradient(rgb(var(--color-ink-rgb)/0.055)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-ink-rgb)/0.055)_1px,transparent_1px)] [background-size:32px_32px] p-4 text-[var(--color-ink)]"
            role="status"
            aria-live="polite"
        >
            <MotionDiv
                variants={panelMotion}
                initial="initial"
                animate="enter"
                className="relative w-full max-w-[640px]"
            >
                <div className="absolute inset-0 translate-x-3 translate-y-3 border-2 border-[var(--color-ink)] bg-[var(--color-accent)]" />

                <div className="relative border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] shadow-[8px_8px_0_var(--color-ink)]">
                    <div className="flex items-center justify-between gap-4 border-b-2 border-[var(--color-ink)] bg-[var(--color-panel)] p-4 text-[var(--color-paper-light)] sm:p-5">
                        <span className="font-display text-xl font-black uppercase leading-none sm:text-2xl">Portfolio</span>
                    </div>

                    <div className="p-5 sm:p-8">
                        <div className="mb-5 flex items-end gap-4 border-b-2 border-[var(--color-ink)] pb-5">
                            <span className="font-serif text-3xl font-black italic leading-none text-[var(--color-accent)]">
                                01
                            </span>
                            <MotionP
                                key={loadingWords[index]}
                                variants={wordMotion}
                                initial="initial"
                                animate="enter"
                                className="break-words font-display text-4xl font-black uppercase leading-[0.9] tracking-normal text-[var(--color-ink)] sm:text-5xl md:text-6xl"
                            >
                                {loadingWords[index]}
                            </MotionP>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-5 gap-2" aria-hidden="true">
                                {loadingWords.map((word, wordIndex) => (
                                    <span
                                        key={word}
                                        className={`h-8 border-2 border-[var(--color-ink)] ${wordIndex <= index
                                                ? "bg-[var(--color-accent)] shadow-[2px_2px_0_var(--color-ink)]"
                                                : "bg-[var(--color-paper)]"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </MotionDiv>
        </MotionDiv>
    );
}
