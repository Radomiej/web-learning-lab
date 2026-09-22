import { useCallback, useState } from "react";

function resolveInitialValue(initialValue) {
  return typeof initialValue === "function" ? initialValue() : initialValue;
}

function readStoredValue(key, initialValue) {
  const fallback = resolveInitialValue(initialValue);
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch {
    return fallback;
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue));

  const updateValue = useCallback(
    (nextValue) => {
      setValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        } catch {
          // A full or restricted storage must not make the editor unusable.
        }
        return resolvedValue;
      });
    },
    [key],
  );

  const resetValue = useCallback(() => {
    setValue(resolveInitialValue(initialValue));
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Reset still updates memory when storage is unavailable.
    }
  }, [initialValue, key]);

  return [value, updateValue, resetValue];
}
