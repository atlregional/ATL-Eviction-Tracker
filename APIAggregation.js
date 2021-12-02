require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./models');
const MONGODB_URI = process.env.MONGODB_URI;
const moment = require('moment');
const axios = require('axios');
const SOCRATA_API_SECRET = process.env.SOCRATA_API_SECRET;
const SOCRATA_API_KEY = process.env.SOCRATA_API_KEY;
// const TOKEN = process.env.TOKEN;

const includedCounties = [
	'063', //Clayton
	'067', //Cobb
	'089', //DeKalb
	'121', //Fulton
	'135' //Gwinnett
];

mongoose
	.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('DB Connected');
	})
	.catch(err => {
		console.log('DB Connection ERROR: ', err);
	});

const sortByDate = dateField => {
	return (a, b) => {
		const dateA = new Date(a[dateField]).getTime();
		const dateB = new Date(b[dateField]).getTime();
		return dateA > dateB ? -1 : 1;
	};
};

const fetchData = async () => {
	const gaTechData = [];
	const fultonData = [];
	await axios
		.get(
			'https://sharefulton.fultoncountyga.gov/resource/qh59-mhjw.json?$limit=50000',
			{
				auth: { username: SOCRATA_API_KEY, password: SOCRATA_API_SECRET }
			}
		)
		.then(({ data }) => {
			data
				.filter(item => includedCounties.includes(item.countyfp10))
				.sort(sortByDate('filedate'))
				.forEach(item =>
					fultonData.push({ ...item, totalfilings: Number(item.totalfilings) })
				);
		})
		.catch(err => console.log('Error Fetching Fulton Data: ', err));
	await axios
		.get(
			'https://evictions.design.gatech.edu/rest/atlanta_metro_area_tracts?select=id,filedate,tractid,countyfp10,totalfilings,totalansweredfilings'
		)
		.then(({ data }) => {
			data
				.filter(item => includedCounties.includes(item.countyfp10))
				.sort(sortByDate('filedate'))
				.forEach(item =>
					gaTechData.push({
						...item,
						totalfilings: Number(item.totalfilings),
						totalansweredfilings: Number(item.totalansweredfilings)
					})
				);
		})
		.catch(err => console.log('Error Fetching GT Data: ', err));

	return [gaTechData, fultonData];
};

const aggregateTractMonth = ([fromGaTech, fromFulton]) => {
	const filteredArr = fromGaTech.filter(({countyfp10}) => countyfp10 !== '121');
	const dataArr = [...filteredArr, ...fromFulton].sort(sortByDate('filedate'));
	const obj = {};

	dataArr
  .filter(({filedate}) => new Date(filedate).getTime() >= new Date('1/1/2020'))
  .forEach(({filedate, totalfilings, tractid, countyfp10}) => {
		const filingMonth = moment(filedate)
			.startOf('month')
			.format('MM/DD/YYYY');

		const key = tractid;
		const duringPandemic = new Date(filedate) >= new Date('04/01/2020');

    if (obj[key]) {
      if (obj[key].FilingsByMonth[filingMonth]) {
        obj[key].FilingsByMonth[filingMonth] += totalfilings;
      } else {
        obj[key].FilingsByMonth[filingMonth] = totalfilings
      }
    } else {
      obj[key] = {
        TractID: tractid,
        CountyID: countyfp10,
        FilingsByMonth : {
          [filingMonth] : totalfilings,
          'During the Pandemic' : 0
        }
      }
    }

    if (duringPandemic) {
      obj[key].FilingsByMonth['During the Pandemic'] += totalfilings
    }

		// obj[key]
		// 	? (obj[key] = {
		// 			...obj[key],
    //       montlyFilings: {
    //         ...obj[key],
    //       }
		// 			TotalFilings: (obj[key].TotalFilings += item.totalfilings)
		// 	  })
		// 	: (obj[key] = {
		// 			FilingMonth: filingMonth,
		// 			TractID: item.tractid,
		// 			CountyID: item.countyfp10,
		// 			TotalFilings: item.totalfilings
		// 	  });

		// duringPandemic
		// 	? obj[pandemicKey]
		// 		? (obj[pandemicKey] = {
		// 				...obj[pandemicKey],
		// 				TotalFilings: (obj[pandemicKey].TotalFilings += item.totalfilings)
		// 		  })
		// 		: (obj[pandemicKey] = {
		// 				FilingMonth: 'During the Pandemic',
		// 				TractID: item.tractid,
		// 				CountyID: item.countyfp10,
		// 				TotalFilings: item.totalfilings
		// 		  })
		// 	: null;
	});



	return Object.values(obj);
};

const aggregateCounty = ([fromGaTech, fromFulton], type) => {
	const endDateFromGaTech = fromGaTech.sort(sortByDate('filedate'))[0].filedate;

	const dataArr = [
		...fromGaTech,
		...fromFulton.filter(
			item =>
				new Date(item.filedate).getTime() >
				new Date(endDateFromGaTech).getTime()
		)
	];

  const baselineDataArr = 	dataArr
  .filter(({filedate}) => new Date(filedate).getTime() >= new Date('1/1/2019').getTime() &&
    new Date(filedate).getTime() < new Date('1/1/2020').getTime()
  );

	const obj = {};

	dataArr
  .filter(item => new Date(item.filedate).getTime() >= new Date('1/1/2020'))
  .forEach(item => {
		const date = moment(item.filedate)
			.startOf(type.toLowerCase())
			.format('MM/DD/YYYY');
    

		const key = `${item.countyfp10}-${date}`;

    //Add baseline value by evaluating the 

		obj[key]
			? (obj[key] = {
					...obj[key],
					TotalFilings: (obj[key].TotalFilings += item.totalfilings),
					AnsweredFilings: item.totalansweredfilings
						? (obj[key].AnsweredFilings += item.totalansweredfilings)
						: obj[key].AnsweredFilings
			  })
			: (obj[key] = {
					[`Filing${type}`]: date,
					CountyID: item.countyfp10,
					TotalFilings: item.totalfilings,
					AnsweredFilings: item.totalansweredfilings
						? item.totalansweredfilings
						: 0
			  });

    const totalKey = `999-${date}`

    obj[totalKey]
			? (obj[totalKey] = {
					...obj[totalKey],
					TotalFilings: (obj[totalKey].TotalFilings += item.totalfilings),
					AnsweredFilings: item.totalansweredfilings
						? (obj[totalKey].AnsweredFilings += item.totalansweredfilings)
						: obj[totalKey].AnsweredFilings
			  })
			: (obj[totalKey] = {
					[`Filing${type}`]: date,
					CountyID: '999',
					TotalFilings: item.totalfilings,
					AnsweredFilings: item.totalansweredfilings
						? item.totalansweredfilings
						: 0
			  });
	});


  // Object.values(obj).forEach(item =>
  //   obj['BaselineFilings'] = [0, ...baselineDataArr.filter(baselineItem =>
  //     baselineItem.countyfp10 === item.CountyID  
  //       ? type === 'Monthly' 
  //           ? moment(baselineItem.filedate).format('MM') === moment(item[`Filing${type}`]).format('MM')
  //           : moment(baselineItem.filedate).week() === moment(item[`Filing${type}`]).week()
  //     : false

  //     )].reduce(item => parseInt(item.totalfilings) || 0)
    
  //   )



	return Object.values(obj);
};

fetchData()
	.then(data => {
    // console.log(aggregateTractMonth(data))
		Promise.allSettled([
		// 	db.tractMonth
		// 		.deleteMany({})
		// 		.then(() =>
		// 			db.tractMonth
		// 				.insertMany(aggregateTractMonth(data))
		// 				.then(() => console.log('Tract Month Updated'))
		// 				.catch(err => {
		// 					console.log(err);
		// 				})
		// 		)
		// 		.catch(err => console.log(err)),

			db.countyMonth
				.deleteMany({})
				.then(() =>
					db.countyMonth
						.insertMany(aggregateCounty(data, 'Month'))
						.then(() => console.log('County Month Updated'))
						.catch(err => console.log(err))
				)
				.catch(err => console.log(err)),

			db.countyWeek
				.deleteMany({})
				.then(() =>
					db.countyWeek
						.insertMany(aggregateCounty(data, 'Week'))
						.then(() => console.log('County Week Updated'))
						.catch(err => console.log(err))
				)
				.catch(err => console.log(err))
		])
			.then(() => console.log('Collection successfully updated'))
			.catch(err => console.log('Error Settling Promise: ', err));
	})

	.catch(err => console.log('Error Fetching Data: ', err));
