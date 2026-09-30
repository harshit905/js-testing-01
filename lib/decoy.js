// Same-named local symbols that are NOT the third-party APIs. An assessment must not count these as call sites.
function transformRequest(payload) {
  return { ...payload, local: true };
}

const AxiosTransformer = "not the axios type, just a string constant";

module.exports = { transformRequest, AxiosTransformer };
