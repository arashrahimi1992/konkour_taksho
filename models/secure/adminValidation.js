const Yup=require('yup');

exports.adminSchema = Yup.object().shape({
    adminName: Yup.string()
        .required("نام الزامی می باشد")
        .min(3,"نام نباید کمتر از سه کاراکتر باشد")
        .max(255,"نام نباید بیشتر از 255 کاراکتر باشد"),
    adminLastName: Yup.string()
        .required("نام خانوادگی الزامی می باشد")
        .min(3,"نام خانوادگی نباید کمتر از سه کاراکتر باشد")
        .max(255,"نام خانوادگی نباید بیشتر از 255 کاراکتر باشد"),
    adminEmail: Yup
    .string()
    .email("ایمیل معتبر نمی باشد")
    .required("ایمیل الزامی است"),
    adminPassword: Yup.string()
    .min(6,"رمز عبور نباید کمتر از 6 کاراکتر باشد")
    .max(255,"رمز عبور نباید بیشتر از 255 کاراکتر باشد")
    .required("رمز عبور نمیتواند خالی باشد"),
  adminConfirmPassword: Yup.string()
        .required("تکرار رمز عبور نمیتواند خالی باشد")
        .oneOf([Yup.ref("adminPassword"), null],"کلمه های عبور یکسان نیستند"),
    adminPhone: Yup.number(" شماره تلفن معتبر نمی باشد"),   

});