let numOr0 = n => isNaN(n) ? 0 : parseFloat(n)
const Numbers = {
    fmt: (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
    sum: (nums) => nums.reduce((a, b) => numOr0(a) + numOr0(b), 0)
}
export default Numbers
