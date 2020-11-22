const UUID_KEY = "LOCAL_UUID";
let s4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};
const UUID = (function () {
  let instance;

  function getNew() {
    let uuid = localStorage.getItem(UUID_KEY);
    if (!uuid) {
      uuid =
        s4() +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        s4() +
        s4();
      localStorage.setItem(UUID_KEY, uuid);
    }
    return uuid;
  }

  return {
    get: function () {
      if (!instance) {
        instance = getNew();
      }
      return instance;
    },
  };
})();

export default UUID;
