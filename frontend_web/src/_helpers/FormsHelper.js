export const FormsHelper = {
  notEmpty(msg = "This field can not be empty") {
    return {
      valid: val => (val ? true : false),
      error: msg
    };
  }
};
