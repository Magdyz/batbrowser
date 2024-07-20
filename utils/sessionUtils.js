const sessionCleanUp = async (session) => {
  try {
    // Clear cache
    await session.clearCache();
    console.log("Cache cleared");

    // Clear all storage data
    await session.clearStorageData();
    console.log("Storage data cleared");
  } catch (error) {
    console.error("Error during session cleanup:", error);
  }
};

module.exports = { sessionCleanUp };
