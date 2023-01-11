function regularDateFormat(date) {
  const [year, month, day, hour, minute, second] = [
    date.substr(0, 4),
    parseInt(date.substr(4, 2)) - 1,
    date.substr(6, 2),
    date.substr(9, 2),
    date.substr(11, 2),
    date.substr(13, 2),
  ];
  return new Date(`${year}/${month}/${day} ${hour}:${minute}:${second} UTC`);
}

module.exports = regularDateFormat;
