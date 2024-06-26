import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
// import util from './util';
import DateInfo from './DateInfo.jsx';

const ChartTooltip = (
  { active, payload, label },
  {
    timeScale,
    totalFilingsIndicator,
    baselineIndicator,
    countyFilter,
    county
  }
) => {
  const info = payload[0] ? payload[0].payload : {};

  const totalFilings = info[totalFilingsIndicator]
    ? numeral(info[totalFilingsIndicator]).format('0,0')
    : '?';

  const {
    PercentDifferenceFromBaseline,
    DifferenceFromBaselineDirection
  } = info

  // const differenceFromBaseline = info['PercentDifferenceFromBaseline']

  // const totalAnswers = info[answeredFilingsIndicator]
  //   ? numeral(info[answeredFilingsIndicator]).format('0,0')
  //   : '?';

  // const answerRate =
  //   info[totalFilingsIndicator] && info[answeredFilingsIndicator]
  //     ? numeral(
  //       info[answeredFilingsIndicator] / info[totalFilingsIndicator]
  //     ).format('0.0%')
  //     : '?';

  const total2019 = info[baselineIndicator]
    ? numeral(info[baselineIndicator]).format('0,0')
    : '?';

  return active ? (
    <div className='tooltip-content chart-tooltip-content'>
      <div>
        In {`${countyFilter}` === '999' ? 'the ' : ''}
        <span className='tooltip-data'>{county.text}</span>{' '}<DateInfo timeScale={timeScale} label={label}  />, there
        were <span className='tooltip-data'>{totalFilings}</span> reported
        eviction filings. For comparison, there were <span className='tooltip-data'>{total2019}</span>, or <span className='tooltip-data'>{PercentDifferenceFromBaseline}{' '}{DifferenceFromBaselineDirection}</span>, filings for the same
        duration in 2019.
      </div>
    </div>
  ) : null;
};

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string
};

export default ChartTooltip;
