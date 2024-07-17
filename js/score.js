export function score(rank){
  var top10Score = 250/(Math.log(3 * rank + 10) / Math.log(13));
  var top11_50Score = (Math.sin(0.08 * (rank + 8.905))*70) + 100;
  var top51_75Score = 1.83 + (1/(0.0036*(rank-41)))

  if(rank => 1){ //rank has to be above 1
    if(rank < 11)//if rank is 10 or above
    { 
      return round(top10Score);
    }
    else if(rank > 10 & rank < 51)//if rank is between 11 and 50
    { 
      return round(top11_50Score)
    }
    else if(rank > 50 && rank < 76)//if rank is between 51 and 75
    { 
      return round(top51_75Score);
    }
    else //return 0 if rank goes beyond 75 (it counts as legacy)
    {
      return 0;
    }
  }
}

const scale = 2; //Select how many decimal digits to round to

/** Returns a rounded number by decimal point, set by scale
 * @param {Number} num      Number to round
 * @param {Number} scale    Number of decimal points to round to
 * @returns {Number}        Rounded number
 */
export function round(num)
{
    return Math.round(num*(10**scale))/(10**scale);
}
