"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InputWithEyeProps {
  id: string;
  name: string;
  required?: boolean;
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InputWithEye({
  id,
  name,
  required,
  label,
  value,
  onChange,
}: InputWithEyeProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
