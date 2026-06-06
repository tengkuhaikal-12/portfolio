"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const words = [
    "Assalamualaikum", "Salam Sejahtera", "Hello", "你好", "Vanakkam", "ஹலோ", "こんにちは", "안녕하세요", 
];

const opacity = {
    initial: {
        opacity: 0,
    },
    enter: {
        opacity: 0.75,
        transition: { duration: 1, delay: 0.2 },
    },
};

const slideUp = {
    initial: {
        top: 0,
    },
    exit: {
        top: "-100vh",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
    },
};

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionPath = motion.path;

function getViewportDimension() {
    if (typeof window === "undefined") {
        return { width: 0, height: 0 };
    }

    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
}

export default function Preloader({ onComplete }) {
    const [index, setIndex] = useState(0);
    const [dimension, setDimension] = useState(getViewportDimension);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const handleResize = () => setDimension(getViewportDimension());

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        let timer;
        let completeTimer;

        if (index === words.length - 1) {
            timer = setTimeout(() => {
                setIsExiting(true);

                completeTimer = setTimeout(() => {
                    onComplete?.();
                }, 1000);
            }, 1000);

            return () => {
                clearTimeout(timer);
                clearTimeout(completeTimer);
            };
        }

        timer = setTimeout(
            () => {
                setIndex((prev) => prev + 1);
            },
            index === 0 ? 1000 : 150
        );

        return () => clearTimeout(timer);
    }, [index, onComplete]);

    const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2
        } ${dimension.height + 300} 0 ${dimension.height} L0 0`;

    const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2
        } ${dimension.height} 0 ${dimension.height} L0 0`;

    const curve = {
        initial: {
            d: initialPath,
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
        },
        exit: {
            d: targetPath,
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 },
        },
    };

    return (
        <MotionDiv
            variants={slideUp}
            initial="initial"
            animate={isExiting ? "exit" : "initial"}
            className="fixed inset-0 z-[99999999999] flex h-screen w-screen items-center justify-center bg-[var(--color-loading-backdrop)]"
        >
            {dimension.width > 0 && (
                <>
                    <MotionP
                        variants={opacity}
                        initial="initial"
                        animate="enter"
                        className="absolute z-10 flex items-center text-4xl font-medium text-[var(--color-loading-text)] md:text-5xl lg:text-6xl"
                    >
                        <span className="mr-2.5 block h-2.5 w-2.5 rounded-full bg-[var(--color-loading-text)]" />
                        {words[index]}
                    </MotionP>

                    <svg className="absolute top-0 h-[calc(100%+300px)] w-full">
                        <MotionPath
                            variants={curve}
                            initial="initial"
                            animate={isExiting ? "exit" : "initial"}
                            fill="var(--color-loading-bg)"
                        />
                    </svg>
                </>
            )}
        </MotionDiv>
    );
}
