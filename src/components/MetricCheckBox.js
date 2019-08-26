import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { Checkbox, FormGroup, FormControlLabel } from '@material-ui/core'
const GET_METRICS = gql`
    query {
        getMetrics
    }
`

class MetricCheckBox extends React.Component {
    state = {
        selected: [],
    }

    handleOnChange = selectedValue => {
        const { setSelected } = this.props
        const { selected } = this.state
        const { value } = selectedValue
        let newSelected = []

        if (this.isMetricSelected(value)) {
            newSelected = selected.filter(
                eachSelected => eachSelected.value !== value
            )
        } else {
            newSelected = [...selected, selectedValue]
        }

        setSelected(() => newSelected.map(eachSelected => eachSelected.value))

        this.setState({
            selected: newSelected,
        })
    }

    isMetricSelected = metric => {
        const { selected } = this.state
        let isSelected = false
        selected.forEach(eachSelected => {
            if (eachSelected.value === metric) {
                isSelected = true
            }
        })

        return isSelected
    }

    render() {
        return (
            <Query query={GET_METRICS}>
                {({ loading, error, data }) => {
                    if (loading) return 'Loading...'
                    if (error) return `Error! ${error.message}`
                    const options = data.getMetrics.map(metric => ({
                        value: metric,
                        label: metric,
                    }))

                    return (
                        <>
                            <h3>Select Metrics: </h3>
                            <FormGroup row>
                                {options.map(option => {
                                    const { value, label } = option
                                    return (
                                        <FormControlLabel
                                            key={label}
                                            control={
                                                <Checkbox
                                                    checked={this.isMetricSelected(
                                                        value
                                                    )}
                                                    onChange={() =>
                                                        this.handleOnChange(
                                                            option
                                                        )
                                                    }
                                                    value={value}
                                                />
                                            }
                                            label={label}
                                        />
                                    )
                                })}
                            </FormGroup>
                        </>
                    )
                }}
            </Query>
        )
    }
}

export default MetricCheckBox
