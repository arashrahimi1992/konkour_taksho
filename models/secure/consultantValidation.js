const Yup=require('yup');

exports.consultantSchema = Yup.object().shape({
    consultantName: Yup.string()
        .required("نام الزامی می باشد")
        .min(3,"نام نباید کمتر از سه کاراکتر باشد")
        .max(255,"نام نباید بیشتر از 255 کاراکتر باشد"),
    consultantLastName: Yup.string()
        .required("نام خانوادگی الزامی می باشد")
        .min(3,"نام خانوادگی نباید کمتر از سه کاراکتر باشد")
        .max(255,"نام خانوادگی نباید بیشتر از 255 کاراکتر باشد"),
    consultantEmail: Yup
        .string()
        .email("ایمیل معتبر نمی باشد")
        .required("ایمیل الزامی است"),
    consultantPassword: Yup.string()
        .min(6,"رمز عبور نباید کمتر از 6 کاراکتر باشد")
        .max(255,"رمز عبور نباید بیشتر از 255 کاراکتر باشد")
        .required("رمز عبور نمیتواند خالی باشد"),
    consultantConfirmPassword: Yup.string()
        .required("تکرار رمز عبور نمیتواند خالی باشد")
        .oneOf([Yup.ref("consultantPassword"), null],"کلمه های عبور یکسان نیستند"),

    consultantPhone: Yup.number()
        .required(" شماره تلفن معتبر نمی باشد"),
        
    consultantUniversity:Yup.string()
        .required("دانشگاه محل تحصیل را وارد کنید"),
    
    consultantRank:Yup.number()
    .required("رتبه دانشگاه را وارد کنید "),

    consultantZone:Yup.string()
    .required("منطقه ی خود را وارد کنید"),

    consultantYear:Yup.number()
    .required("سال کنکور نباید خالی باشد"),
   

    consultantField:Yup.string()
    .required("رشته دبیرستان نباید خالی باشد"),

    consultantContent:Yup.string()
    .required("متن مربوط به معرفی مشاور نباید خالی باشد "),

    consultantCategory:Yup.string()
    .required("حوزه ی مشاوره نباید خالی باشد."),

    thumbnails: Yup.object().shape({
        name: Yup.string().required("عکس بند انگشتی الزامی می باشد"),
        size: Yup.number().max(3000000, "عکس نباید بیشتر از 3 مگابایت باشد"),
        mimetype: Yup.mixed().oneOf(
            ["image/jpeg", "image/png"],
            "تنها پسوندهای png و jpeg پشتیبانی می شوند"
        ),
    }),
    


});