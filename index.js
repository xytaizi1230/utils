function decodeEach(code, list, str) {
  if (!list.length) return str;
  const ss = list.shift();
  const off = /[0-9A-F]{2}/.test(ss);
  if (!off) {
    return decodeEach("", list, (str += ss));
  }
  let s = code + ss;
  try {
    str += decodeURIComponent(s);
    s = "";
  } catch (error) {}
  // eslint-disable-next-line no-unused-vars
  return decodeEach(s, list, str);
}

export default function decode(s2) {
  try {
    s2 = decodeURIComponent(s2);
  } catch (error) {
    const first = s2.charAt(0);
    const list = s2.split("%").map((i) => `%${i}`);
    if (first !== "%") {
      s2 = decodeEach("", list, list.shift().replace(/^%/, ""));
    } else {
      s2 = decodeEach("", list, "");
    }
  }
  return s2;
}
