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
    log13 = Math.log(3 * rank + 10) / Math.log(13);
    log5 = Math.log(rank) / Math.log(5);

    if (rank => 1) {
        if (rank < 11) {
          return round(250 / log13, 2);
        }}

    if (rank > 75) {
        return 0;
    }
    let score = (-24.9975*Math.pow(rank-1, 0.4) + 200);
        score = Math.max(0, score);
        return Math.max(round(score), 0);
}

export function round(num) {
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
