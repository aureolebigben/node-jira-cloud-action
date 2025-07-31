/**
 * This file is used to mock the `@actions/http-client` module in tests.
 */
import { jest } from '@jest/globals'

export const mockGetJson = jest.fn()
export const mockPostJson = jest.fn()
export const mockPutJson = jest.fn()
export const mockPatchJson = jest.fn()
export const mockDeleteJson = jest.fn()

// Mock for HttpClient
export class HttpClient {
  constructor(userAgent, handlers) {
    this.userAgent = userAgent
    this.handlers = handlers
  }

  // Mock methods with Jest functions
  getJson = mockGetJson
  postJson = mockPostJson
  putJson = mockPutJson
  patchJson = mockPatchJson
  deleteJson = mockDeleteJson
}

export const mockPrepareRequest = jest.fn()
// Mock for BasicCredentialHandler
export class BasicCredentialHandler {
  constructor(username, password) {
    this.username = username
    this.password = password
  }

  // Mock prepareRequest method
  prepareRequest = mockPrepareRequest
}
