import { firebaseApp } from './firebase-config';

export const logoutUser = async () => {
  return await firebaseApp.auth().signOut();
};

export const signInUser = async ({ name, email, password }) => {
  try {
    await firebaseApp.auth().createUserWithEmailAndPassword(email, password);
    firebaseApp.auth().currentUser?.updateProfile({
      displayName: name
    });

    return {};
  } catch (error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return {
          error: "E-mail already in use."
        };
      case "auth/invalid-email":
        return {
          error: "Invalid e-mail address format."
        };
      case "auth/weak-password":
        return {
          error: "Password is too weak."
        };
      case "auth/too-many-requests":
        return {
          error: "Too many request. Try again in a minute."
        };
      default:
        return {
          error: "Check your internet connection."
        };
    }
  }
};

export const loginUser = async ({ email, password }) => {
  let errorMessage = '';
  try {
    const user = await firebaseApp.auth().signInWithEmailAndPassword(email, password);
    return user.user;
  } catch (error) {
    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Invalid email address format.";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
        errorMessage: "Invalid email address or password.";
        break;
      case "auth/too-many-requests":
        errorMessage: "Too many request. Try again in a minute.";
        break;
      default:
        errorMessage: "Check your internet connection.";
        break;
    }
    alert(errorMessage);
  }
};

export const sendEmailWithPassword = async email => {
  try {
    await firebaseApp.auth().sendPasswordResetEmail(email);
    return {};
  } catch (error) {
    switch (error.code) {
      case "auth/invalid-email":
        return {
          error: "Invalid email address format."
        };
      case "auth/user-not-found":
        return {
          error: "User with this email does not exist."
        };
      case "auth/too-many-requests":
        return {
          error: "Too many request. Try again in a minute."
        };
      default:
        return {
          error: "Check your internet connection."
        };
    }
  }
};
