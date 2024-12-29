module.exports = {
    yearMonthToRange(year, month){
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        return {
            startDate,
            endDate
        }
    }
}