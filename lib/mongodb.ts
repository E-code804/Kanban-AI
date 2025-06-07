import mongoose from "mongoose";

// Track connection status
let isConnected = false;

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in environment variables.");
  }

  // Check if already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    // console.log("Using existing MongoDB connection.");
    return;
  }

  try {
    // Connection options for better performance and reliability
    // const options = {
    //   maxPoolSize: 10, // Maintain up to 10 socket connections
    //   serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    //   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    //   bufferMaxEntries: 0, // Disable mongoose buffering
    //   bufferCommands: false, // Disable mongoose buffering
    // };

    await mongoose.connect(mongoUri); //, options);

    isConnected = true;
    // console.log("Successfully connected to MongoDB.");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected.");
      isConnected = false;
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed through app termination.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    isConnected = false;
    throw error; // Re-throw to let caller handle the error
  }
}

// Function to explicitly disconnect
export async function disconnectDB() {
  if (isConnected) {
    try {
      await mongoose.connection.close();
      isConnected = false;
      console.log("MongoDB connection closed.");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
      throw error;
    }
  }
}
