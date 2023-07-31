const Yup=require('yup');

exports.userSchema = Yup.object().shape({
    userName: Yup.string()
        .required("نام الزامی می باشد")
        .min(3,"نام نباید کمتر از سه کاراکتر باشد")
        .max(255,"نام نباید بیشتر از 255 کاراکتر باشد"),
    userLastName: Yup.string()
        .required("نام خانوادگی الزامی می باشد")
        .min(3,"نام خانوادگی نباید کمتر از سه کاراکتر باشد")
        .max(255,"نام خانوادگی نباید بیشتر از 255 کاراکتر باشد"),
    userEmail: Yup
        .string()
        .email("ایمیل معتبر نمی باشد")
        .required("ایمیل الزامی است"),
    userPassword: Yup.string()
        .min(6,"رمز عبور نباید کمتر از 6 کاراکتر باشد")
        .max(255,"رمز عبور نباید بیشتر از 255 کاراکتر باشد")
        .required("رمز عبور نمیتواند خالی باشد"),
    userConfirmPassword: Yup.string()
        .required("تکرار رمز عبور نمیتواند خالی باشد")
        .oneOf([Yup.ref("userPassword"), null],"کلمه های عبور یکسان نیستند"),
    userPhone: Yup.number(" شماره تلفن معتبر نمی باشد"),   

});