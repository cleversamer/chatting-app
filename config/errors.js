const system = Object.freeze({
  internal: {
    en: "An un expected error happened on the server",
    ar: "حصل خطأ في السيرفر الداخلي",
  },
  unsupportedRoute: {
    en: "Unsupported route",
    ar: "الرابط غير مدعوم",
  },
  largeFile: {
    en: "Max file size is 20MB",
    ar: "أقصى حجم للملف هو 20 ميجا بايت",
  },
  noFile: {
    en: "Submission file is not included",
    ar: "ملف التسليم غير مرفق",
  },
  invalidMongoId: {
    en: "Invalid document id",
    ar: "معرّف المستند غير صالح",
  },
});

const auth = Object.freeze({
  notFound: {
    en: "User not found",
    ar: "المستخدم غير موجود",
  },
  deleteItself: {
    en: "You can't delete your account",
    ar: "لا يمكنك حذف حسابك",
  },
  invalidCode: {
    en: "Invalid verification code",
    ar: "الكود غير صالح",
  },
  incorrectCode: {
    en: "Incorrect verification code",
    ar: "الكود خاطئ",
  },
  expiredCode: {
    en: "Verification code is expired",
    ar: "الكود منتهي الصلاحية",
  },
  invalidToken: {
    en: "You're unauthorized",
    ar: "يجب عليك تسجيل الدخول",
  },
  hasNoRights: {
    en: "You don't have enough rights",
    ar: "ليس لديك الصلاحيات الكافية",
  },
  notVerified: {
    en: "Your account is not verified",
    ar: "حسابك ليس مفعل",
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
  invalidNickname: {
    en: "Nickname should be (4 ~ 32 characters) length",
    ar: "إسم الكنية يجب أن يكون بين 4-32 حرفا",
  },
  invalidRole: {
    en: "Role should be either student or teacher",
    ar: "نوع المستخدم يجب أن يكون طالب أو معلّم",
  },
});

const user = Object.freeze({
  noUsers: {
    en: "There are no users yet",
    ar: "لا يوجد هناك مستخدمين بعد",
  },
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
  hasNoRooms: {
    en: "You're not a member in any room",
    ar: "أنت لست عضوا في أي غرفة",
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
  notJoined: {
    en: "You're not a member in this room",
    ar: "أنت لست عضواً في هذه الغرفة",
  },
  invalidMessage: {
    en: "You can't send an empty message",
    ar: "لا يمكنك ارسال رسالة فارغة",
  },
  incorrectCode: {
    en: "Incorrect registeration code",
    ar: "كود التسجيل خاطئ",
  },
  alreadyExist: {
    en: "Room name is already exist",
    ar: "اسم الغرفة موجود بالفعل",
  },
  chatBlocked: {
    en: "The admin has blocked you from sending messages",
    ar: "الآدمن قام بمنعك من إرسال الرسائل",
  },
});

const message = Object.freeze({
  invalidType: {
    en: "Invalid message type",
    ar: "نوع الرسالة غير مدعوم",
  },
  noFile: {
    en: "Please add a file",
    ar: "يرجى اضافة ملف",
  },
});

const assignments = Object.freeze({
  notFound: {
    en: "Assignment was not found",
    ar: "التكليف غير موجود",
  },
  expired: {
    en: "Assignment has expired",
    ar: "مدة تسليم التكليف انتهت",
  },
  hasSubmission: {
    en: "You have already added a submission",
    ar: "لقد قمت بإضافة تسليم مسبقاً",
  },
  noFile: {
    en: "You have to add a file",
    ar: "يجب عليك إضافة ملف",
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
  assignments,
  message,
};
