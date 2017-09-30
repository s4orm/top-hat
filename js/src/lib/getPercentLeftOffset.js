/**
 * @description Return offset from left, for loading line
 * @param x
 * @param max
 * @returns {*}
 */
function getPercentLeftOffset (x, max) {

    if ((x == 0)||(x == 100)) {
        return max;
    }
    return Math.ceil(max - (max/100*x));
}