"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DotsVertical } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface CompareProps {
    firstImage?: string;
    secondImage?: string;
    className?: string;
    firstImageClassName?: string;
    secondImageClassname?: string;
    initialSliderPercentage?: number;
    slideMode?: "hover" | "drag";
    showHandlebar?: boolean;
}

export const Compare = ({
    firstImage = "",
    secondImage = "",
    className,
    firstImageClassName,
    secondImageClassname,
    initialSliderPercentage = 50,
    slideMode = "hover",
    showHandlebar = true
}: CompareProps) => {
    const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    const mouseLeaveHandler = () => {
        if (slideMode === "hover") setSliderXPercent(initialSliderPercentage);
        if (slideMode === "drag") setIsDragging(false);
    };

    const handleStart = useCallback((clientX: number) => {
        if (slideMode === "drag") setIsDragging(true);
    }, [slideMode]);

    const handleEnd = useCallback(() => {
        if (slideMode === "drag") setIsDragging(false);
    }, [slideMode]);

    const handleMove = useCallback((clientX: number) => {
        if (!sliderRef.current) return;
        if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
            const rect = sliderRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const percent = (x / rect.width) * 100;
            requestAnimationFrame(() => {
                setSliderXPercent(Math.max(0, Math.min(100, percent)));
            });
        }
    }, [slideMode, isDragging]);

    return (
        <div
            ref={sliderRef}
            className={cx("relative w-full mb-8 max-w-[400px] h-[400px] overflow-hidden select-none", className)}
            style={{ cursor: slideMode === "drag" ? (isDragging ? "grabbing" : "grab") : "col-resize" }}
            onMouseMove={(e) => handleMove(e.clientX)}
            onMouseLeave={mouseLeaveHandler}
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseUp={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
            onTouchEnd={handleEnd}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        >
            {/* Handlebar Line */}
            <div
                className="pointer-events-none absolute top-0 bottom-0 w-px z-40 bg-indigo-500"
                style={{ left: `${sliderXPercent}%` }}
            >
                {showHandlebar && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-200">
                        <DotsVertical className="h-4 w-4 text-gray-600" />
                    </div>
                )}
            </div>

            {/* Top Image (The one being clipped) */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                <motion.div
                    className="w-full h-full"
                    style={{ clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)` }}
                    transition={{ duration: 0 }}
                >
                    <img
                        alt="first"
                        src={firstImage}
                        className={cx(
                            "w-full h-full object-contain object-center",
                            firstImageClassName
                        )}
                        draggable={false}
                    />
                </motion.div>
            </div>

            {/* Bottom Image (The background) */}
            <div className="absolute inset-0 z-10">
                <img
                    alt="second"
                    src={secondImage}
                    className={cx(
                        "w-full h-full object-contain object-center",
                        secondImageClassname
                    )}
                    draggable={false}
                />
            </div>
        </div>
    );
};