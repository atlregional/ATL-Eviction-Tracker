require('dotenv').config();
const moment = require('moment');
const db = require('./models');
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;
const fs = require('fs');
// const axios = require('axios');
// const TOKEN = process.env.TOKEN;

mongoose.connect(MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const includedCounties = [
	// '063', //Clayton
	'067', //Cobb
	// '089', //DeKalb
	// '121', //Fulton
	// '135' //Gwinnett
];

const getBuildingInfo = async () => {
	// const url =
	// 	'http://evictions.design.gatech.edu/rest/atlanta_metro_area_cases';

	// const filings = await axios
	// 	.get(url, {
	// 		headers: { Authorization: `Bearer ${TOKEN}` }
	// 	})
	// 	.then(res => res.data)

  const buildingsArray = []
	// 	.catch(err => console.log('Error Fetching Data: ', err.message));
  for await (countyID of includedCounties){  
    const filings = await db.cases.find({county: countyID})
    // console.log(filings);
    if (filings) {
      const buildingInfo = {};

      for await (record of filings) {
        // console.log(record)
        if (record.fileDate && new Date(record.fileDate) >= new Date('01/01/2020')) {
          const street = record.street ? record.street : record.streetAddress ? record.streetAddress : ''
          const keyString = `${street}-${`${record.city}`.trim()}-${`${record.zip}`.trim()}`;
          const key = keyString.replace(/ /g, '-').toLowerCase();
          // console.log(key);
          buildingInfo[key]
            ? buildingInfo[key].filings.push({
              ...record,
              filingdate: record.fileDate
            })
            : buildingInfo[key] = {
                _id: key,
                street: street.trim(),
                city: `${record.city}`.trim(),
                zip: `${record.zip}`.trim(),
                county: record.county,
                latitude: record.latitude,
                longitude: record.longitude,
                geometry: record.geometry,
                tractid: record.tractID,
                blockgroupid: record.blockGroupID,
                filings: [{
                  ...record,
                  filingdate: record.fileDate
                }]
              };
        }

      }

      var getMonthArray = function(s,e) {for(var a=[],d=new Date(s);d<=e;d.setDate(d.getDate()+1)){ a.push(moment(new Date(d)).startOf('month').format('MM/DD/YYYY'));}return a;};

      const monthArray = [...new Set(getMonthArray(new Date('01/1/2020'), new Date()))];

      const aggregateBy = (filings, dateField, type) => {
        const obj = {};
        if (type === 'countByMonth') {
          filings.forEach(filing => {
            const monthOfFiling = moment(filing[dateField]).startOf('month').format('MM/DD/YYYY');
            obj[monthOfFiling]
              ? (obj[monthOfFiling] = obj[monthOfFiling] + 1)
              : (obj[monthOfFiling] = 1);
          });
        };

        const array = monthArray.map(month => ({
            date: month,
            count: obj[month] || 0
          }))

        return array;
      };

      // console.log(buildingInfo)

      Object.entries(buildingInfo).forEach(([key, value]) => {
        const totalFilings = value.filings.length;
        const pandemicFilings = value.filings.filter(filing =>
            new Date(filing['filingdate']) >= 
            new Date('4/1/2020')
          ).length;
        buildingInfo[key]['totalfilings'] = totalFilings;
        buildingInfo[key]['pandemicfilings'] = pandemicFilings;
        buildingInfo[key]['pandemicratio'] = pandemicFilings / totalFilings;
        // console.log(aggregateBy(value.filings, 'filingdate', 'countByMonth'));
        buildingInfo[key]['monthlyfilings'] = aggregateBy(
          value.filings,
          'filingdate',
          'countByMonth'
        );;
      });

      const array = Object.entries(buildingInfo)
      .filter(([key, value]) => value.pandemicfilings >= 10)
      .map(([key, value]) => ({
        _id: key,
        ...value
      }));

      buildingsArray.push(...array)
    }
  }
  return buildingsArray;
};

const init = () => {
	getBuildingInfo()
		.then(async array => {
      console.log(array.length);
			if (array) {
				const buildings = array.filter(
						buildingInfo =>
							buildingInfo.zip && 
              buildingInfo.city && 
              buildingInfo.street &&
              buildingInfo.tractid !== '99999999999' &&
              buildingInfo.pandemicfilings >= 10
					)

				// db.building.deleteMany().then(() =>
					db.building.insertMany(buildings)
						.then(data => {
							console.log(
								data.length,
								'records inserted on',
								moment().format('MMMM D, YYYY [at] h:mm:ss a')
							);
							// process.exit(0);
						})
						.catch(err => {
							console.log('Error Updating DB: ', err.message);
							// process.exit(1);
						})
				// );
			} else console.log('Error: DB not updated.');
		})
		.catch(err => {
			console.log(err);
			// process.exit(1);
		});
};

init();

// module.exports = init;
