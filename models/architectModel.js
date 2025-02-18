const {db, admin} = require("../config/firebase");
const {sendSMS} = require("../helpers/projectIdHelper");

async function createArchitect(data) {
  try {
    //  phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(data.phone)) {
      throw new Error("Phone number must be exactly 10 digits");
    }

    // for unique phone number
    const snapshot = await db.collection("architects").where("phone", "==", data.phone).get();

    if (!snapshot.empty) {
      throw new Error("Phone number already exists");
    }

    const newArchitectRef = db.collection("architects").doc();
    const currentTime = new Date();
    const expiresAt = new Date(currentTime.getTime() + 12 * 60 * 60 * 1000);
    const architectData = {
      ...data,
      role: "architect",
      otp: null,
      expiresAt: expiresAt.toISOString(),
      createdAt: currentTime,
    };

    await newArchitectRef.set(architectData);
    sendSMS({phoneNumbers: data.phone, type: "architectadded"});
    return newArchitectRef.id;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function getArchitects() {
  try {
    const snapshot = await db.collection("architects").get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      };
    });
  } catch (error) {
    throw new Error(`Failed to retrieve architects: ${error.message}`);
  }
}

async function getArchitectById(id) {
  try {
    const doc = await db.collection("architects").doc(id).get();
    if (!doc.exists) {
      throw new Error("Architect not found");
    }
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    };
  } catch (error) {
    throw new Error(`Failed to retrieve architect: ${error.message}`);
  }
}

async function updateArchitect(id, updateData) {
  try {
    if (updateData.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(updateData.phone)) {
        throw new Error("Phone number must be exactly 10 digits");
      }

      const snapshot = await db
        .collection("architects")
        .where("phone", "==", updateData.phone)
        .where(admin.firestore.FieldPath.documentId(), "!=", id)
        .get();

      if (!snapshot.empty) {
        throw new Error("Phone number already exists");
      }
    }

    const architectRef = db.collection("architects").doc(id);
    await architectRef.update(updateData);
    return {id, ...updateData};
  } catch (error) {
    throw new Error(`Failed to update architect: ${error.message}`);
  }
}

async function deleteArchitect(id) {
  try {
    await db.collection("architects").doc(id).delete();
    return {message: "Architect deleted successfully"};
  } catch (error) {
    throw new Error(`Failed to delete architect: ${error.message}`);
  }
}
async function loginUser(phoneNumber, otp) {
  try {
    // Fetch user by phone number
    const userSnapshot = await db.collection("architects").where("phone", "==", phoneNumber).get();

    if (userSnapshot.empty) {
      throw new Error("No User Found with this Number");
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();


    if (!otp) {
      // Generate OTP if it's a new login attempt

      const newOtp = Math.floor(100000 + Math.random() * 900000);
      const expiresAt = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes validity

      await db.collection("architects").doc(userDoc.id).update({
        otp: newOtp,
        expiresAt: expiresAt.toISOString(),
      });
      sendSMS({phoneNumbers: phoneNumber, variableValues: newOtp, type: "otp"});
      // console.log(`Generated OTP for ${phoneNumber}:`, newOtp); // Integrate with SMS service here
      return {message: "OTP sent successfully"};
    }

    const currentTime = new Date().getTime();
    const otpExpiresAt = new Date(userData.expiresAt).getTime();

    console.log("OTP from user:", otp);
  

    // Ensure otp is a number for comparison
    if (userData.otp !== Number(otp)) {
      throw new Error("Invalid OTP.");
    }

    // Ensure current time is within expiration time
    if (currentTime > otpExpiresAt) {
      throw new Error("Expired OTP.");
    }

    // Reset OTP after successful login
    await db.collection("architects").doc(userDoc.id).update({otp: null});

    return {uid: userDoc.id, phoneNumber: userData.phone, name: userData.name, role: userData.role};
  } catch (error) {
    throw new Error(`${error}`);
  }
}
module.exports = {
  createArchitect,
  getArchitects,
  getArchitectById,
  updateArchitect,
  deleteArchitect,
  loginUser,
};
