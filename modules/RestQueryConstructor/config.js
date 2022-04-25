module.exports = {
	modelQueryConfig: {
		cases: {
			authenticate: true,
			queryableFields: [
				'_id',
				'fileDate',
				'answer',
				'latitude',
				'longitude',
				'services',
				'dismiss',
				'defaultJudgment',
				'judgment',
				'answerDate',
				'servicesDate',
				'dismissDate',
				'defaultJudgmentDate',
				'judgmentDate',
				'tractID',
				'blockGroupID',
				'id',
				'streetAddress',
				'city',
				'zip',
				'county',
				'geometry',
				'caseID',
				'plaintiff',
				'defendantName1',
				'defendantName2',
				'attorney',
				'judgmentType',
				'judgmentFor',
				'caseStatus',
				'address',
				'year'
			],
			globalDeselectFields: [
				'answerDateISO',
				'defaultJudgmentDateISO',
				'dismissDateISO',
				'fileDateISO',
				'judgmentDateISO',
				'servicesDateISO',
				'__v'
			],
			csvDeselectFields: ['geometry', 'events'],
			filingDate: { field: 'fileDate', iso: 'fileDateISO' },
			yearQueryField: 'year',
			countyField: 'county'
		},
		filingsByTractDaily: {
			authenticate: false,
			queryableFields: ['_id', 'FilingDate', 'TractID', 'CountyID', 'Year'],
			filingDate: { field: 'FilingDate', iso: 'FilingDateISO' },
			yearQueryField: 'Year',
			globalDeselectFields: ['FilingDateISO', '__v']
		},
		filingsByTractMonth: {
			authenticate: false,
			queryableFields: ['_id', 'TractID', 'CountyID'],
			globalDeselectFields: ['__v']
		},
		filingsByCountyMonth: {
			authenticate: false,
			queryableFields: ['_id', 'FilingMonth', 'CountyID', 'Year'],
			filingDate: { field: 'FilingMonth', iso: 'FilingMonthISO' },
			globalDeselectFields: ['FilingMonthISO', '__v'],
			yearQueryField: 'Year'
		},
		filingsByCountyWeek: {
			authenticate: false,
			queryableFields: ['_id', 'FilingWeek', 'CountyID', 'Year'],
			filingDate: { field: 'FilingWeek', iso: 'FilingWeekISO' },
			globalDeselectFields: ['FilingWeekISO', '__v'],
			yearQueryField: 'Year'
		},
		buildings: {
			authenticate: false,
			queryableFields: [
				'_id',
				'street',
				'latitude',
				'longitude',
				'county',
				'geometry',
				'tractid',
				'blockgroupid',
				'city',
				'zip'
			],
			globalDeselectFields: ['__v'],
			csvDeselectFields: ['geometry', 'filings', 'monthlyfilings']
		}
	},
	errStrings: {
		auth: {
			tokenAttempt:
				'Error: This API no longer uses tokens for authentication. Please take your token and pass it into the query (e.g., apiKey={YOUR TOKEN}). Then remove the authorization header.',
			noApiKey:
				'Error: Please ensure your API Key is included in the query, e.g., apiKey={YOUR API KEY}',
			invalidApiKey: 'Error: Invalid API Key. Please check apiKey for errors.'
		},
		verify: {
			noQuery: field =>
				`Error: A query must be made for this API. Please add a query to request and try again (e.g., ${field}={SOME VALUE}).`,
			singleQueriesNotMet: arr =>
				`Error: [${arr.join(', ')}] cannot have multiple queries.`,
			forcedQueriesNotMet: arr => {
				const forcedFieldsStr = arr.map(({ text }) => text).join(' AND ');

				const exampleStr = arr
					.map(({ key }) => `${key}={SOME VALUE}`)
					.join('&');

				return `Error: [${forcedFieldsStr}] must be present in a query to get a response. (e.g., ${exampleStr})`;
			},
			noCounty: countyArr =>
				`Error: No county query present. Please query by a county you have permissions for. Counties you can make requests for: ${countyArr.join(
					', '
				)}`,
			unauthorizedCounty: countyArr =>
				`Error: Unauthorized county request. Counties you can make requests for: ${countyArr.join(
					', '
				)}`,
			unauthorizedQuery: (key, permittedVal) =>
				`Error: Unauthorized ${key} query. Your API key only permits ${permittedVal} to be requested. Please edit your ${key} query to be within the permitted value. Optionally, you may leave a ${key} parameter off of your request and the return will only contain documents you have access to.`
		},
		dates: {
			dateAndYear:
				'Error: Cannot query both a single date/date range and a year. Please choose one or the other.',
			multipleDateRanges: 'Error: Cannot query multiple date ranges.',
			rangeOrMultipleDates: 'Error: Please query a range or multiple dates.',
			noDateQueryType: 'Error: Query type case not met.',
			invalidRange: limit =>
				`Error: Date range queries for this API are limited to ${limit}`,
			multipleYears: field =>
				`Error: Cannot query a range of years. Please only enter one year (e.g., ${field}=2022)`
		}
	}
};
