import moment from "moment";
import SortByDate from "../../utils/SortByDate";

export default {
  dataObjectForCSV: (propObj) => {
    const timeLabel =
      propObj.timeScale === "weekly"
        ? "Week of"
        : propObj.timeScale === "monthly"
        ? "Month"
        : "Filing Date";
    return {
      [timeLabel]: moment(propObj.item[propObj.dateField]).format(
        propObj.timeScale === "monthly" ? "MMMM YYYY" : "M/D/YYYY"
      ),
      [propObj.indicator1]:
        propObj.item[propObj.indicator1] + propObj.item[propObj.indicator2],
      [propObj.indicator2]: propObj.item[propObj.indicator2],
      "Answer Rate":
        propObj.item[propObj.indicator2] /
        (propObj.item[propObj.indicator1] + propObj.item[propObj.indicator2]),
      "Baseline (Total Filings, 2019)":
        propObj.item["Baseline (Total Filings, 2019)"],
    };
  },
  filterDataToEndOfLastWeek: (key, endDate) =>
    new Date(key).getTime() <=
    new Date(moment(endDate).endOf("week")).getTime(),
  filterDataToEndOfLastFullMonth: (key, endDate) =>
    new Date(endDate).getTime() <
    new Date(moment(endDate).endOf("month").subtract({ days: 2 })).getTime()
      ? new Date(key).getTime() !==
        new Date(moment(endDate).startOf("month")).getTime()
      : true,

  // dataFormattedForChart: ({data, comparisonData}) => {
  //   const dataArray = [];

  //   const getBaselinValue = (fileDate, type)

  //   data.forEach(obj =>{
  //     const baselineValue = })

    
  //   return dataArray;
  // },

  referenceAreaStart: (timeScale, brushDomainStart, config) =>
    timeScale === "weekly"
      ? new Date(brushDomainStart).getTime() <
        new Date(config.weekly.start).getTime()
        ? config.weekly.start
        : null
      : new Date(brushDomainStart).getTime() <
        new Date(config.monthly.start).getTime()
      ? config.monthly.start
      : null,
  referenceAreaEnd: (timeScale, brushDomainEnd, config) =>
    timeScale === "weekly"
      ? new Date(brushDomainEnd).getTime() >
        new Date(config.weekly.end).getTime()
        ? config.weekly.end
        : null
      : new Date(brushDomainEnd).getTime() >
        new Date(config.monthly.end).getTime()
      ? config.monthly.end
      : null,
};
