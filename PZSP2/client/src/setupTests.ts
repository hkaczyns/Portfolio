/// <reference types="node" />
import "@testing-library/jest-dom";
import { fetch as crossFetch, Headers, Request, Response } from "cross-fetch";
import { TextEncoder, TextDecoder } from "util";

if (!globalThis.fetch) {
    globalThis.fetch = crossFetch;
}
if (!globalThis.Headers) {
    globalThis.Headers = Headers;
}
if (!globalThis.Request) {
    globalThis.Request = Request;
}
if (!globalThis.Response) {
    globalThis.Response = Response;
}
if (!globalThis.TextEncoder) {
    globalThis.TextEncoder = TextEncoder;
}
if (!globalThis.TextDecoder) {
    globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}
