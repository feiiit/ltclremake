/**
 * Numbers of decimal digits to round to
 */
const scale = 3;

/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @returns {Number}
 */
export function score(rank) {
    var log13 = Math.log(3 * rank + 10) / Math.log(13);
    var log5 = Math.log(rank) / Math.log(5);

    if (rank => 1) {
      if (rank < 11) {
        return round(250 / log13, 2);
      } else if (rank > 10) {
        if (rank < 50) {
          return round((250 * Math.sin(90 - (1000 / 28745 * rank)) / log5) - 10, 2);
        }
        else {
          return 0;
        }
      }
    }
  }

export function round(num, scale) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        var arr = ('' + num).split('e');
        var sig = '';
        if (+arr[1] + scale > 0) {
            sig = '+';
        }
        return +(Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) + 'e-' + scale);
    }
}
