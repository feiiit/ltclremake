/**
 * Numbers of decimal digits to round to
 */
const scale = 2;

// /**
//  * Calculate the score awarded when having a certain percentage on a list level
//  * @param {Number} rank Position on the list
//  * @param {Number} percent Percentage of completion
//  * @param {Number} minPercent Minimum percentage required
//  * @returns {Number}
//  */
// export function score(rank, percent, minPercent) {
//     var log13 = Math.log(3 * rank + 10) / Math.log(13);
//     var log5 = Math.log(rank) / Math.log(5);

//     if (rank => 1) {
//       if (rank < 11) {
//         return round(250 / log13, 2);
//       } else if (rank > 10) {
//         if (rank < 76) {
//           return round((250 * Math.sin(90 - (1000 / 28745 * rank)) / log5) - 10, 2);
//         }
//         else {
//           return 0;
//         }
//       }
//     }
//   }
export function score(rank){
  var top10Score = 250/Math.log(3 * rank + 10) / Math.log(13);
  var top11_50Score = (Math.sin(0.08 * (rank + 8.905))*70) + 100;
  var top51_75Score = 1.83 + (1/(0.0036*(rank-40)))

  if(rank => 1){ //rank has to be above 1
    if(rank < 11)//if rank is 10 or above
    { 
      return round(top10Score);
    }
    else if(rank > 10 & rank < 51)//if rank is between 11 and 50
    { 
      return round(top11_50Score)
    }
    else if(rank > 51 && rank < 75)//if rank is between 51 and 75
    { 
      return round(top51_75Score);
    }
    else //return 0 if rank goes beyond 75 (it counts as legacy)
    {
      return 0;
    }
  }
}
export function round(num){
  return Math.round(num*100)/100;
}
