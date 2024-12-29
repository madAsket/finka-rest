const catchAsync = require("../utils/catchAsync");
const { yearMonthToRange } = require("../utils/dateFormatter");
const AnalyticService = require("../services/AnalyticService");

const expensesAnalytic = catchAsync(async (req,res,next)=>{
    const {month, year} = req.query;
    const projectId = req.params.id;
    const {startDate, endDate} = yearMonthToRange(year, month);
    const {stat:summarizedStatistic, categories} = await AnalyticService.getSummmarizedExpenseStatistic(projectId, startDate, endDate);
    let prevMonth = month - 1;
    let prevYear = year;
    if(prevMonth === 0){
        prevMonth = 12;
        prevYear-=1;
    }
    const {startDate:prevStartDate, endDate:prevEndDate} = yearMonthToRange(prevYear, prevMonth);
    const {stat:previousSummarizedStatistic} = await AnalyticService.getSummmarizedExpenseStatistic(projectId, prevStartDate, prevEndDate);
    return res.status(201).json({
        status:"success",
        data:{
            summarize:{
                selected:summarizedStatistic,
                previous:previousSummarizedStatistic,
            },
            categories
        }
    });
});

module.exports = {
    expensesAnalytic
}