const Yup=require('yup');

exports.productSchema = Yup.object().shape({
   
        productName: Yup.string()
        .required("نام محصول الزامی می باشد")
        .min(3,"نام نباید کمتر از سه کاراکتر باشد")
        .max(255,"نام نباید بیشتر از 255 کاراکتر باشد"),
    
        productLittleTitle : Yup.string()
        .required("عنوان کوتاه محصول الزامی می باشد")
        .min(3,"عنوان کوتاه محصول نباید کمتر از سه کاراکتر باشد")
        .max(255,"عنوان کوتاه محصول نباید بیشتر از 255 کاراکتر باشد"),
    
       productPrice:Yup.number()
       .required("قیمت محصول را وارد نمایید ")
       .positive()
       .integer(),

       productCount:Yup.number()
       .required("تعداد محصول را وارد کنید ")
       .positive()
       .integer(),

       productOffer:Yup.number()
       .required("میزان تخفیف را وارد کنید")
       .min(0,"!تخفیف نمیتواند از صفر درصد کمتر باشد")
       .max(100,"!تخفیف حداکثر میتواند 100% باشد")
       .positive("تخفیف باید مقداری مثبت باشد")
       .integer("تخفیف باید عدد صحی باشد"),

       productAvailable:Yup.string()
       .required("موجودی محصول نباید خالی باشد"),

       productContent:Yup.string()
      .required("متن مربوط به محصول نباید خالی باشد."),

       productCategory:Yup.number()
       .required("دسته بندی محصول نباید خالی باشد."),

       thumbnail: Yup.object().shape({
        name: Yup.string().required("عکس بند انگشتی الزامی می باشد"),
        size: Yup.number().max(3000000, "عکس نباید بیشتر از 3 مگابایت باشد"),
        mimetype: Yup.mixed().oneOf(
            ["image/jpeg", "image/png"],
            "تنها پسوندهای png و jpeg پشتیبانی می شوند"
        ),
    }),

});