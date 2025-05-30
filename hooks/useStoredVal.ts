import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export function useStoredVal<T>(key: string, initialValue: T) {
  const { getItem, setItem, removeItem } = useAsyncStorage(key);
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const storedValue = await getItem();
        if (storedValue !== null) {
          setValue(JSON.parse(storedValue));
        }
      } catch (error) {
        console.error("Failed to load stored value:", error);
      }
    };

    loadStoredValue();
  }, [key]);

  const storeValue = async (newValueOrUpdater: T | ((prev: T) => T)) => {
    try {
      const newValue =
        typeof newValueOrUpdater === "function"
          ? (newValueOrUpdater as (prev: T) => T)(value)
          : newValueOrUpdater;

      await setItem(JSON.stringify(newValue));
      setValue(newValue);
    } catch (error) {
      console.error("Failed to store value:", error);
    }
  };

  const removeValue = async () => {
    try {
      await removeItem();
      setValue(initialValue);
    } catch (error) {
      console.error("Failed to remove value:", error);
    }
  };

  return [value, storeValue, removeValue] as const;
}
