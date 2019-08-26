import React from 'react';
import { connect } from 'react-redux';

import MetricCard from './MetricCard';

const CardSection = ({ selectedMetrics, latestValue }) => {
    return <React.Fragment>
        {selectedMetrics.map((s, key) => (
            <MetricCard key={key}
                currentValue={latestValue[s]}
                title={s}
            />
        ))}
    </React.Fragment>
}

const mapStateToProps = ({ metrics: { latestValue } }) => ({
    latestValue
})

export default connect(
    mapStateToProps
)(CardSection)