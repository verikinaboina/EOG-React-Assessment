import { takeEvery, take, call, put, fork, select } from 'redux-saga/effects'
import * as actions from '../actions'
import api from '../api'
import { eventChannel } from 'redux-saga'

const getMetrics = ({ metrics: { metrics } }) => metrics

function* aggregateSaga(dataList) {
    let data = yield select(getMetrics)
    dataList.map(item => {
        const { metric, at, value } = item
        const hours = new Date(at).getHours() % 12 || 12
        const minutes = new Date(at).getMinutes()
        const timeAt = `${('0' + hours).slice(-2)}:${('0' + minutes).slice(-2)}`
        data = {
            ...data,
            [at]: {
                ...data[at],
                [metric]: value,
                at: timeAt,
            },
        }
        return null
    })
    yield put({ type: actions.METRICS_RECEIVED_MULTI, metrics: data })
}

function* processDataSaga(newData) {
    const { metric, at, value } = newData
    let data = yield select(getMetrics)
    const lastLatestValue = yield select(state => state.metrics.latestValue)
    const hours = new Date(at).getHours() % 12 || 12
    const minutes = new Date(at).getMinutes()
    const timeAt = `${('0' + hours).slice(-2)}:${('0' + minutes).slice(-2)}`
    data = {
        ...data,
        [at]: {
            ...data[at],
            [metric]: value,
            at: timeAt,
        },
    }
    const latestValue = {
        ...lastLatestValue,
        [metric]: value,
    }
    yield put({ type: actions.METRICS_RECEIVED, metrics: data, latestValue })
}

const createChannel = sub =>
    eventChannel(emit => {
        const handler = data => {
            emit(data)
        }
        sub.subscribe(handler)
        return () => {
            sub.unsubscribe()
        }
    })

function* liveUpdates(action) {
    const sub = yield call(api.subscribeLive)
    const subscription = yield call(createChannel, sub)
    while (true) {
        const { data } = yield take(subscription)
        yield fork(processDataSaga, data.newMeasurement)
    }
}

function* fetch30MinutesData(action) {
    const { data } = yield call(api.FetchLast30mints, action.metricName)
    const newData = data.getMeasurements
    yield fork(aggregateSaga, newData)
}

function* watchFetch() {
    yield takeEvery(actions.GET_THIRTY_MINS_DATA, fetch30MinutesData)
}

function* watchStartLiveUpdates() {
    yield takeEvery(actions.START_LIVE_UPDATES, liveUpdates)
}

export default [watchFetch, watchStartLiveUpdates]
