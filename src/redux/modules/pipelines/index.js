import { call, put } from 'redux-saga/effects';
import backendClient from '@/middleware/backendClient';
import { actions as jobsActions } from '@/redux/modules/jobs';
import { createSlice, createSelector, startFetching, stopFetching } from '@/redux/utils';
import hash from '+utils/hash';

const initialState = {
  isFetching: false,
  error: '',
  pipelines: [],
};

let api;

const initApi = () => {
  if (!api) {
    api = backendClient();
  }
};

const baseUrl = '/pipeline';

const slice = createSlice({
  name: 'pipelines',
  initialState,
  reducers: {
    fetchPipelines: startFetching,
    fetchPipeline: startFetching,
    createPipeline: startFetching,
    updatePipeline: startFetching,
    deletePipeline: startFetching,

    createJob: startFetching,
    updateJob: startFetching,
    deleteJob: startFetching,

    createEdge: startFetching,

    fetchPipelinesSuccess: (state, { payload: { projectId, data } }) => {
      stopFetching(state);
      const hashedPipelines = hash(data || [], 'id');
      if (JSON.stringify(hashedPipelines) === JSON.stringify( { } ) ) {
        state.pipelines[projectId] = [];
      } else {
        state.pipelines[projectId] = hashedPipelines;
      }
    },

    createPipelineSuccess: (state, { payload: pipeline }) => {
      stopFetching(state);
      const hashedKey = hash([pipeline] || [], 'id');
      state.pipelines[pipeline.project] = { ...state.pipelines[pipeline.project], ...hashedKey };
    },

    updatePipelineSuccess: (state, { payload: pipeline }) => {
      stopFetching(state);
      state.pipelines[pipeline.id] = pipeline;
    },

    deletePipelineSuccess(state, { payload: [projectId, pipelineId] }) {
      stopFetching(state);
      delete state.pipelines[projectId][pipelineId];
    },

    createJobSuccess: (state) => {
      stopFetching(state);
    },

    updateJobSuccess: (state) => {
      stopFetching(state);
    },

    deleteJobSuccess: (state) => {
      stopFetching(state);
    },

    createEdgeSuccess: (state, { payload: pipeline }) => {
      stopFetching(state);
      const hashedKey = hash(pipeline['pipe'] || [], 'id');
      state.pipelines[pipeline.projectId] = { ...state.pipelines[pipeline.projectId], ...hashedKey };
    },

    clearPipelines: (state) => {
      state.pipelines = {};
    },

    requestFail(state, { payload: { message } }) {
      stopFetching(state);
      state.error = message;
    },

    cancel: stopFetching,
  },

  sagas: (actions) => ({
    [actions.fetchPipelines]: {
      * saga({ payload: projectId }) {
        initApi();

        try {
          const url = `${baseUrl}/${projectId}`;
          const { data } = yield call(api.get, url);
          yield put(actions.fetchPipelinesSuccess({ projectId: projectId, data: data.data['pipelines'] }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.fetchPipeline]: {
      * saga({ payload: { projectId, pipelineId } }) {
        initApi();

        try {
          const url = `${baseUrl}/path/${pipelineId}`;
          const { data } = yield call(api.get, url);
          yield put(actions.fetchPipelinesSuccess({ projectId, data: data.data['pipelines'] }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.createPipeline]: {
      * saga({ payload: pipeline }) {
        initApi();

        try {
          const url = `${baseUrl}/create/${pipeline.project}`;
          const { data } = yield call(api.post, url, pipeline);
          yield put(actions.createPipelineSuccess(data.data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.updatePipeline]: {
      * saga({ payload: pipeline }) {
        initApi();

        try {
          const url = `${baseUrl}/${pipeline.id}`;
          const { data } = yield call(api.put, url, pipeline);
          yield put(actions.updatePipelineSuccess(data.data));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.deletePipeline]: {
      * saga({ payload: [projectId, pipelineId] }) {
        initApi();
        try {
          const url = `${baseUrl}/delete/${projectId}/${pipelineId}`;
          yield call(api.delete, url);
          yield put(actions.deletePipelineSuccess([projectId, pipelineId]));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.createJob]: {
      * saga({ payload: job }) {
        initApi();
        try {
          const jobUrl = '/jobs';
          const createParams = {
            name: job.name,
            content: JSON.stringify(job.content),
            omeroIds: job.omeroIds,
            status: 0,
          };
          const { data } = yield call(api.post, jobUrl, createParams);
          yield put(jobsActions.createJobSuccess(data.data));

          const pipelineUrl = `${baseUrl}/conn/${job.rootId ?? job.pipelineId}/${data.data.id}/${job.pipelineId}`;
          yield call(api.get, pipelineUrl);

          yield put(actions.fetchPipeline({
            projectId: job.projectId,
            pipelineId: job.pipelineId,
          }));

          yield put(actions.createJobSuccess());
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.updateJob]: {
      * saga({ payload: job }) {
        initApi();
        try {
          const updateParams = {
            name: job.name,
            content: JSON.stringify(job.content),
            omeroIds: job.omeroIds,
          };
          const jobUrl = `/jobs/${job.id}`;
          const { data } = yield call(api.put, jobUrl, updateParams);
          yield put(jobsActions.updateJobSuccess(data.data));

          yield put(actions.fetchPipeline({
            projectId: job.projectId,
            pipelineId: job.pipelineId,
          }));

          yield put(actions.updateJobSuccess());
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.deleteJob]: {
      * saga({ payload: { projectId, pipelineId, jobId } }) {
        initApi();
        try {
          const pipelineUrl = `${baseUrl}/delete/${pipelineId}/${jobId}`;
          yield call(api.delete, pipelineUrl);

          const jobUrl = `/jobs/${jobId}`;
          yield call(api.delete, jobUrl);
          yield put(jobsActions.deleteJobSuccess(jobId));

          yield put(actions.fetchPipeline({ projectId, pipelineId }));

          yield put(actions.deleteJobSuccess());
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },

    [actions.createEdge]: {
      * saga({ payload: pipeline }) {
        initApi();
        try {
          const url = `${baseUrl}/${pipeline.projectId}/${pipeline.boxId}`;
          let createData = { 'name': 'edge', 'project': pipeline.projectId };
          if (pipeline.tasks_ids) {
            createData.tasks_ids = pipeline.tasks_ids;
          }
          if (pipeline.resource_ids) {
            createData.resource_ids = pipeline.resource_ids;
          }
          yield call(api.post, url, createData );
          const pipeUrl = `${baseUrl}/path/${pipeline.projectId}/${pipeline.pipeline}`;
          const pipe = yield call(api.get, pipeUrl);
          yield put(actions.createEdgeSuccess({ ...pipeline, pipe: pipe['data']['data']['pipelines'] }));
        } catch (error) {
          yield put(actions.requestFail(error));
          // eslint-disable-next-line no-console
          console.error(error.message);
        }
      },
    },
  }),

  selectors: (getState) => ({
    isFetching: createSelector(
      [getState],
      (state) => state?.isFetching,
    ),

    getPipelines: (projectId) => createSelector(
      [getState],
      (state) => state?.pipelines[projectId],
    ),

    getPipeline: (projectId, pipelineId) => createSelector(
      [getState],
      (state) => state?.pipelines[projectId]?.[pipelineId],
    ),
  }),
});

export const { actions, selectors } = slice;
export default slice;
