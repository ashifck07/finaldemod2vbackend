const {db, bucket} = require("../config/firebase");

// // Controller to delete an image
// const deleteImage = async (req, res) => {
//   const {imageId} = req.params;

//   try {
//     // Step 1: Retrieve the image document
//     const imageDoc = await db.collection("images").doc(imageId).get();

//     if (!imageDoc.exists) {
//       return res.status(404).json({success: false, message: "Image not found"});
//     }

//     const imageData = imageDoc.data();

//     // Step 2: Delete the file from Firebase Storage
//     const filePath = imageData.path; // Assuming `path` contains the full storage path
//     if (!filePath) {
//       return res.status(400).json({success: false, message: "Image path not found in database"});
//     }
//     const file = bucket.file(filePath);
//     const [exists] = await file.exists();
//     if (!exists) {
//       return res.status(404).json({ success: false, message: "File not found in storage" });
//     }

//     await bucket.file(filePath).delete();

//     // Step 3: Delete the document from Firestore
//     await db.collection("images").doc(imageId).delete();

//     res.status(200).json({success: true, message: "Image and document deleted successfully"});
//   } catch (error) {
//     console.error("Error deleting image:", error);
//     res.status(500).json({success: false, message: "Failed to delete image", error: error.message});
//   }
// };

const deleteImage = async (req, res) => {
  const {imageId} = req.params;

  try {
    // Step 1: Retrieve the image document
    const imageDoc = await db.collection("images").doc(imageId).get();

    if (!imageDoc.exists) {
      return res.status(404).json({success: false, message: "Image not found in Firestore"});
    }

    const imageData = imageDoc.data();
    const fileUrl = imageData.path; // This is the full URL, e.g., 'https://storage.googleapis.com/d2v-interiors.firebasestorage.app/images/download.png'

    if (!fileUrl) {
      return res.status(400).json({success: false, message: "Image URL not found in database"});
    }

    // Step 2: Extract the relative path from the full URL
    const relativePath = fileUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, "");

    // Step 3: Check if the file exists in Firebase Storage
    const file = bucket.file(relativePath); // Use the extracted relative path
    const [exists] = await file.exists();

    if (!exists) {
      return res.status(404).json({success: false, message: "Image not found in Firebase Storage"});
    }

    // Step 4: Delete the file from Firebase Storage
    await file.delete();

    // Step 5: Delete the document from Firestore
    await db.collection("images").doc(imageId).delete();

    res.status(200).json({success: true, message: "document deleted successfully"});
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({success: false, message: "Failed to delete image", error: error.message});
  }
};

const deleteDoc = async (req, res) => {
  const {imageId} = req.params;

  try {
    // Step 1: Retrieve the image document
    const imageDoc = await db.collection("estimates").doc(imageId).get();

    if (!imageDoc.exists) {
      return res.status(404).json({success: false, message: "Image not found in Firestore"});
    }

    const imageData = imageDoc.data();
    const fileUrl = imageData.path; // This is the full URL, e.g., 'https://storage.googleapis.com/d2v-interiors.firebasestorage.app/images/download.png'

    if (!fileUrl) {
      return res.status(400).json({success: false, message: "Image URL not found in database"});
    }

    // Step 2: Extract the relative path from the full URL
    const relativePath = fileUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, ""); // Remove the full URL base to get the relative path
    console.log("Extracted relative path:", relativePath);

    // Step 3: Check if the file exists in Firebase Storage
    const file = bucket.file(relativePath); // Use the extracted relative path
    const [exists] = await file.exists();
    console.log("Does the file exist?", exists);

    if (!exists) {
      return res.status(404).json({success: false, message: "Image not found in Firebase Storage"});
    }

    // Step 4: Delete the file from Firebase Storage
    await file.delete();

    // Step 5: Delete the document from Firestore
    await db.collection("estimates").doc(imageId).delete();

    res.status(200).json({success: true, message: "Image and document deleted successfully"});
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({success: false, message: "Failed to delete image", error: error.message});
  }
};

module.exports = {deleteImage, deleteDoc};
