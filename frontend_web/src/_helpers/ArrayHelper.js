export const ArrayHelper = {
  rem(arrIn, item) {
    let arr = arrIn;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === item) {
        arr.splice(i, 1);
      }
    }
    return arr;
  }
};
