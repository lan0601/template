import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const mutationMethods = new Set(['post', 'put', 'patch', 'delete']);
const dispatchActionLoading = (change) => {
	window.dispatchEvent(new CustomEvent('app:action-loading', { detail: change }));
};

window.axios.interceptors.request.use((config) => {
	if (mutationMethods.has(config.method?.toLowerCase() || '')) {
		config.appActionLoading = true;
		dispatchActionLoading(1);
	}

	return config;
});

const finishActionLoading = (config) => {
	if (config?.appActionLoading) {
		config.appActionLoading = false;
		dispatchActionLoading(-1);
	}
};

window.axios.interceptors.response.use(
	(response) => {
		finishActionLoading(response.config);
		return response;
	},
	(error) => {
		finishActionLoading(error.config);
		return Promise.reject(error);
	},
);
