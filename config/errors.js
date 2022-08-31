const system = Object.freeze({
  internal: {
    en: "An un expected error happened on the server",
    ar: "حصل خطأ في السيرفر الداخلي",
  },
  unsupportedRoute: {
    en: "Unsupported route",
    ar: "الرابط غير مدعوم",
  },
});

const auth = Object.freeze({
  invalidCode: {
    en: "Invalid verification code",
    ar: "كود التفعيل غير صالح",
  },
  incorrectCode: {
    en: "Incorrect verification code",
    ar: "كود التفعيل خاطئ",
  },
  expiredCode: {
    en: "Verification code is expired",
    ar: "كود التفعيل منتهي الصلاحية",
  },
  invalidToken: {
    en: "You're unauthorized",
    ar: "يجب عليك تسجيل الدخول",
  },
  hasNoRights: {
    en: "You don't have enough rights",
    ar: "ليس لديك الصلاحيات الكافية",
  },
  emailNotUsed: {
    en: "Email is not used",
    ar: "البريد الإلكتروني غير مستخدم",
  },
  emailUsed: {
    en: "Email is already used",
    ar: "البريد مسجل بالفعل",
  },
  incorrectCredentials: {
    en: "Incorrect email or password",
    ar: "البريد الإلكتروني أو كلمة المرور غير صحيح",
  },
  invalidEmail: {
    en: "Invalid email address",
    ar: "البريد الإلكتروني غير صالح",
  },
  invalidPassword: {
    en: "Password should be (8 ~ 32 characters) length",
    ar: "كلمة المرور يجب أن تكون بين 8-32 حرفا",
  },
  invalidName: {
    en: "Name should be (1 ~ 64 characters) length",
    ar: "الإسم يجب أن يكون بين 1-64 حرفا",
  },
});

const user = Object.freeze({
  notFound: {
    en: "User was not found",
    ar: "المستخدم غير موجود",
  },
  alreadyVerified: {
    en: "User is already verified",
    ar: "تم التحقق من البريد مسبقا",
  },
  noRooms: {
    en: "You're not a member in any room",
    ar: "أنت لست منضماً لأي غرفة",
  },
});

const rooms = Object.freeze({
  noRooms: {
    en: "There are no rooms out there",
    ar: "لا يوجد غرف مسجلة",
  },
  unauthorized: {
    en: "You don't have admin rights",
    ar: "ليس لديك صلاحيات الآدمن",
  },
  invalidName: {
    en: "Room's name should be (1 ~ 64 characters) length",
    ar: "إسم الغرفة يجب أن يكون بين 1-64 حرفا",
  },
  invalidStatus: {
    en: "Status should be either public or private",
    ar: "يجب أن تكون الغرفة إما خاصة أو عامة",
  },
  invalidCode: {
    en: "Activation code should be (1 ~ 16 characters) length",
    ar: "كود التسجيل يحب أن يكون بين 1-16 حرفا",
  },
  notFound: {
    en: "Room was not found",
    ar: "الغرفة غير موجودة",
  },
  alreadyJoined: {
    en: "You're already joined",
    ar: "أنت منضم للغرفة بالفعل",
  },
  incorrectCode: {
    en: "Incorrect registeration code",
    ar: "كود التسجيل خاطئ",
  },
  alreadyExist: {
    en: "Room name is already exist",
    ar: "اسم الغرفة موجود بالفعل",
  },
});

const codes = Object.freeze({
  duplicateIndexKey: 11000,
});

module.exports = {
  system,
  auth,
  user,
  codes,
  rooms,
};
