const countyWeekly = require('../models/filingsByCountyWeek');
const RestQueryConstructor = require('../modules/RestQueryConstructor');
const ArrayToCsvString = require('../modules/ArrayToCsvString');

module.exports = {
	findAll: async (req, res) => {
		try {
			const {
				query,
				authorized,
				authenticated,
				errMessage,
				deselectString,
				sortString,
				limit,
				type
			} = await RestQueryConstructor({
				model: 'filingsByCountyWeek',
				req
			});

			if (authorized && authenticated) {
				const data = sortString
					? await countyWeekly
							.find(query)
							.limit(limit)
							.sort(sortString)
							.select(deselectString)
							.lean()
					: await countyWeekly
							.find(query)
							.limit(limit)
							.select(deselectString)
							.lean();

				if (type === 'csv' && data[0]) {
					const fileName = `atlanta_region_eviction_tracker_county-weekly_${Date.now()}.csv`;
					const csvStr = await ArrayToCsvString({
						array: data,
						model: 'filingsByCountyWeek'
					});

					return res.status(200).attachment(fileName).send(csvStr);
				} else {
					return res.status(200).json(data);
				}
			} else {
				return res.status(422).json(errMessage);
			}
		} catch (err) {
			// console.log(err);
			res.status(422).json(err);
		}
	},
	insertMany: req => {
		countyWeekly
			.insertMany(req.body)
			.then(() => {
				console.log('database succesfully updated');
				process.exit(0);
			})
			.catch(err => {
				console.error(err);
				process.exit(1);
			});
	}
};
