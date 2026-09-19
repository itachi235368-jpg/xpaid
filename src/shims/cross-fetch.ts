const nativeFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : globalThis.fetch;
const nativeHeaders = typeof window !== 'undefined' ? window.Headers : globalThis.Headers;
const nativeRequest = typeof window !== 'undefined' ? window.Request : globalThis.Request;
const nativeResponse = typeof window !== 'undefined' ? window.Response : globalThis.Response;

export default nativeFetch;
export {
  nativeFetch as fetch,
  nativeHeaders as Headers,
  nativeRequest as Request,
  nativeResponse as Response,
};
