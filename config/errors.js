const auth = {
  invalidToken: "You're unauthorized.",
  hasNoRights: "You don't have enough rights.",
  emailNotUsed: "Email is not used.",
  emailUsed: "Email is already used.",
  incorrectCredentials: "Incorrect email or password.",
  passwordsNotEqual: "Passwords are not the same.",
  invalidEmail: "Invalid email address.",
  invalidPassword: "Password should be (8 ~ 32 characters) length.",
  invalidName: "Firstname and lastname should be (1 ~ 64 characters) length.",
};

const user = {
  notFound: "User was not found.",
  alreadyVerified: "User is already verified.",
};

module.exports = {
  auth,
  user,
};
