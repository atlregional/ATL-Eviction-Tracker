require('dotenv').config();
const moment = require('moment');
const db = require('./models');
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;
const axios = require('axios');
const TOKEN = process.env.TOKEN;

mongoose.connect(MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const getBuildingInfo = async () => {
	// const filings = require('./data/metrocase.json');
	const url =
		'http://evictions.design.gatech.edu/rest/atlanta_metro_area_cases';

	const filings = await axios
		.get(url, {
			headers: { Authorization: `Bearer ${TOKEN}` }
		})
		.then(res => res.data)
		.catch(err => console.log('Error Fetching Data: ', err.message));

	if (filings) {
		const buildingInfo = {};

		await filings.forEach(record => {
			const keyString = `${record.street.trim()}-${record.city.trim()}-${record.zip.trim()}`;
			// const key = `${parseFloat(record.latitude).toFixed(5)}${parseFloat(record.longitude).toFixed(5)}`;
			const key = keyString.replace(/ /g, '-');

			buildingInfo[key]
				? buildingInfo[key].filings.push(record)
				: (buildingInfo[key] = {
						_id: key,
						street: record.street.trim(),
						city: record.city.trim(),
						zip: record.zip.trim(),
						county: record.county,
						latitude: record.latitude,
						longitude: record.longitude,
						tractid: record.tractid,
						blockgroupid: record.blockgroupid,
						filings: [record]
				  });
		});

		const aggregateBy = (filings, dateField, type) => {
			const obj = {};
			if (type === 'countByMonth') {
				filings.forEach(filing => {
					const monthOfFiling = moment(filing[dateField]).startOf('month');
					obj[monthOfFiling]
						? (obj[monthOfFiling] = obj[monthOfFiling] + 1)
						: (obj[monthOfFiling] = 1);
				});
			};

      var getDaysArray = function(s,e) {for(var a=[],d=new Date(s);d<=e;d.setDate(d.getDate()+1)){ a.push(new Date(d));}return a;};

      // const monthArray = getDaysArray

      const array = Object.entries(obj)
        .map(([key,value]) => ({
          date: key,
          count: value
        }))
        .sort((a,b) => new Date(b.date).getTime() > new Date(a.date).getTime() )

			return array;
		};

		Object.entries(buildingInfo).forEach(([key, value]) => {
			buildingInfo[key]['totalfilings'] = value.filings.length;
			// console.log(aggregateBy(value.filings, 'filingdate', 'countByMonth'));
			buildingInfo[key]['monthlyfilings'] = aggregateBy(
				value.filings,
				'filingdate',
				'countByMonth'
			);
		});

		return Object.entries(buildingInfo).map(([key, value]) => ({
			_id: key,
			...value
		}));
	}
};

const filterForMF = buildingInfo => {
	const totalFilings = buildingInfo.filings.length;
	// const totalFilings =
	if (totalFilings < 10) {
		return false;
	}

	return true;
};

const init = () => {
	getBuildingInfo()
		.then(array => {
			if (array) {
				const buildings = array
					.filter(
						buildingInfo =>
							buildingInfo.zip && buildingInfo.city && buildingInfo.street
					)
					.filter(buildingInfo => filterForMF(buildingInfo));

				// console.log(buildings);

				db.building.deleteMany().then(() =>
					db.building
						.insertMany(buildings)
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
				);
			} else console.log('Error: DB not updated.');
		})
		.catch(err => {
			console.log(err);
			// process.exit(1);
		});
};

module.exports = init;