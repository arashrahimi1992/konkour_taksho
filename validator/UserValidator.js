const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateCreateUser = (data) => {
  const schema = Joi.object({

    userName: Joi.string().required(),
    userLastName: Joi.string().required(),
    userPassword: Joi.string().required(),
    userPhone:Joi.number().required(),
    userEmail:Joi.string().required(),
  
  
  });
  return schema.validate(data);
};


const validateLoginUser = (data) => {

  const schema = Joi.object({

    userEmail: Joi.string().required(),
    userPassword: Joi.string().required(),

  });
  return schema.validate(data);
};


module.exports = {validateCreateUser , validateLoginUser};
