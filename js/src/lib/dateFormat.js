/**
 *
 * @description Get date in form 01-01-2015 (dmY) or 2015-02-12 (Ymd)
 * @param date
 * @param format
 * @param splitter - 20-02-2015 / 20/02/2015
 * @param plusTime if there is parameter plusTime, then return date plus time (datetime)
 * @returns {string}
 */
function dateFormat(date, format, splitter, plusTime) {

    if (!date || !format) {
        return '';
    }

    var format = format || 'Ymd';
    var splitter = splitter || '-';

    var date = new Date(date);
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hour = date.getHours().toString();
    var min = date.getMinutes().toString();
    var sec = date.getSeconds().toString();
    var dateStr = '';

    if (min.length < 2) {
        min = '0' + min;
    }

    if (hour.length < 2) {
        hour = '0' + hour;
    }

    switch (format) {

        case 'Ymd':

            dateStr = year + splitter + month + splitter + day + ' ' + hour + ':' + min + ':' + sec;
            break;

        case 'dmY':

            dateStr = day + splitter + month + splitter + year + ' ' + hour + ':' + min + ':' + sec;
            break;
    }

    //only date, without hour, minute and second
    if (!plusTime) {
        dateStr = dateStr.substring(0, 10);
    }

    return dateStr;
}

//var recent = [
//    {id: 123,age :30,start: "10/17/13 13:07"},
//    {id: 13,age :62,start: "07/30/13 16:30"}
//];
//
//then sort like this:
//
//recent.sort(function(a,b) {
//    return new Date(a.start).getTime() - new Date(b.start).getTime()
//});
function dateSort (a,b) {
    return new Date(a.datetimeSort).getTime() - new Date(b.datetimeSort).getTime();
}