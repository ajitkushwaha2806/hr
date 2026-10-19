"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function InlineInput({
    placeholder,
    defaultValue = "",
    onSubmit,
    onCancel,
    autoFocus = true,
    disabled = false,
}) {
    const [value, setValue] = useState(defaultValue);

    const handleSubmit = () => {
        const name = value.trim();

        if (!name) return;

        onSubmit(name);
        setValue("");
    };

    return (
        <Input
            disabled={disabled}
            autoFocus={autoFocus}
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
                if (!value.trim()) {
                    onCancel?.();
                }
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleSubmit();
                }

                if (e.key === "Escape") {
                    setValue("");
                    onCancel?.();
                }
            }}
        />
    );
}