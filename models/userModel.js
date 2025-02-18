const {db} = require("../config/firebase");
const {sendSMS} = require("../helpers/projectIdHelper");

async function registerUser(data) {
  try {
    const {name, phoneNumber, role} = data;

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error("Phone number must be exactly 10 digits");
    }

    const userSnapshot = await db.collection("users").where("phoneNumber", "==", phoneNumber).get();

    if (!userSnapshot.empty) {
      throw new Error("User already exists with this phone number.");
    }
    // Generate OTP and expiration
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(new Date().getTime() + 12 * 60 * 60 * 1000);

    // const newUserRef = db.collection("users").doc();
    // const userId = newUserRef.id;
    const createdAt = new Date().toISOString();

    const newUser = {
      // uid: userId,
      name,
      phoneNumber,
      role,
      superUser: false,
      otp,
      expiresAt: expiresAt.toISOString(),
      createdAt,
    };
    const newUserRef = await db.collection("users").add(newUser);

    return newUserRef;
  } catch (error) {
    throw new Error(`Failed to register user: ${error.message}`);
  }
}

async function loginUser(phoneNumber, otp) {
  try {
    // Fetch user by phone number
    const userSnapshot = await db.collection("users").where("phoneNumber", "==", phoneNumber).get();

    if (userSnapshot.empty) {
      throw new Error("No User Found with this Number");
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    if (!otp) {
      // Generate OTP if it's a new login attempt
      const newOtp = Math.floor(100000 + Math.random() * 900000);
      const expiresAt = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes validity

      await db.collection("users").doc(userDoc.id).update({
        otp: newOtp,
        expiresAt: expiresAt.toISOString(),
      });
      sendSMS({phoneNumbers: phoneNumber, variableValues: newOtp, type: "otp"});
      //  console.log(`Generated OTP for ${phoneNumber}:`, newOtp); // Integrate with SMS service here
      return {message: "OTP sent successfully"};
    }

    const currentTime = new Date().getTime();
    const otpExpiresAt = new Date(userData.expiresAt).getTime();

    console.log("OTP from user:", otp); // Log OTP from the request

    // Ensure otp is a number for comparison
    if (userData.otp !== Number(otp)) {
      throw new Error("Invalid OTP.");
    }

    // Ensure current time is within expiration time
    if (currentTime > otpExpiresAt) {
      throw new Error("Expired OTP.");
    }

    // Reset OTP after successful login
    await db.collection("users").doc(userDoc.id).update({otp: null});

    return {uid: userDoc.id, phoneNumber: userData.phoneNumber, name: userData.name, role: userData.role};
  } catch (error) {
    throw new Error(`${error}`);
  }
}

async function getAllUsers() {
  try {
    const userSnapshot = await db.collection("users").get();
    const users = userSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    return users;
  } catch (error) {
    throw new Error(`Failed to retrieve users: ${error.message}`);
  }
}

async function getUserById(userId) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User not found.");
    }
    return {id: userDoc.id, ...userDoc.data()};
  } catch (error) {
    throw new Error(`Failed to retrieve user: ${error.message}`);
  }
}
async function updateUser(userId, data) {
  try {
    await db.collection("users").doc(userId).update(data);
    return {message: "User updated successfully."};
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}
async function deleteUser(userId) {
  try {
    await db.collection("users").doc(userId).delete();
    return {message: "User deleted successfully."};
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
};
