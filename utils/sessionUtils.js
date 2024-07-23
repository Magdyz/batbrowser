const sessionCleanUp = async (session) => {
  try {
    // Clear cache
    await session.clearCache();
    console.log("Cache cleared");

    // Clear all storage data
    await session.clearStorageData({
      storages: [
        "cookies",
        "backgroundFetch",
        "fileSystems",
        "localstorage",
        "indexeddb",
        "websql",
        "serviceworkers",
      ],
      quotas: ["temporary", "persistent"],
    });
    console.log("Storage data cleared, storages and quotas");
  } catch (error) {
    console.error("Error during session cleanup:", error);
  }
};

module.exports = { sessionCleanUp };
