export const isStorageAccessible = (): boolean => {
  try {
    if (typeof window === "undefined") return false;
    // Accessing localStorage can throw in some iframe/privacy modes.
    const storage = window.localStorage;
    const key = "__revven_storage_test__";
    storage.setItem(key, "1");
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
