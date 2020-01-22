/**
 * @Stake v4
 * Developed by Engagement Lab, 2016-2017
 * ==============
 * Util for shuffling array
 *
 * @class ShuffleUtil
 * @static
 * @author Johnny Richardson
 *
 * ==========
 */

// Arrow functions can't be used as constructors, so we must use function()
// eslint-disable-next-line func-names
module.exports = function (array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};