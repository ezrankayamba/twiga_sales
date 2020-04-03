import invert from "invert-color";
export const ColorsHelper = {
  randomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  },
  randomColors(num) {
    return [...Array(num).keys()].map(() => this.randomColor());
  },
  contrastColors(colors) {
    return colors.map(c => invert(c));
  }
};
