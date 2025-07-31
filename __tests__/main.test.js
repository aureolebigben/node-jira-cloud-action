/**
 * Unit tests for the action's main functionality, src/main.js
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import {
  HttpClient,
  BasicCredentialHandler,
  mockGetJson,
  mockPostJson,
  mockPutJson
} from '../__fixtures__/http-client.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/http-client', () => ({ HttpClient }))
jest.unstable_mockModule('@actions/http-client/lib/auth.js', () => ({
  BasicCredentialHandler
}))

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

function getInputMockFn(name, operation) {
  switch (name) {
    case 'jira_base_url':
      return 'https://your-domain.atlassian.net'
    case 'jira_email':
      return 'test@example.com'
    case 'jira_api_token':
      return 'test-token'
    case 'operation':
      return operation
    case 'project_key':
      return 'PROJECT'
    case 'issue_type':
      return 'Bug'
    case 'summary':
      return 'Test issue'
    case 'description':
      return 'Test description'
    case 'issue_key':
      return 'PROJECT-123'
    case 'transition_id':
      return '31'
    case 'comment':
      return 'Test comment'
    case 'fields_json':
      return ''
    default:
      return ''
  }
}

describe('main.js', () => {
  // Mock response for successful API calls
  const mockSuccessResponse = {
    statusCode: 200,
    result: {
      id: '10000',
      key: 'PROJECT-123',
      self: 'https://your-domain.atlassian.net/rest/api/3/issue/10000'
    }
  }

  // Mock response for failed API calls
  const mockErrorResponse = {
    statusCode: 400,
    result: {
      errorMessages: ['Error occurred'],
      errors: {}
    }
  }

  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks()

    // Default implementation for getInput to return appropriate values based on the input name

    // Mock HttpClient methods to return successful responses by default
    mockGetJson.mockResolvedValue(mockSuccessResponse)
    mockPostJson.mockResolvedValue(mockSuccessResponse)
    mockPutJson.mockResolvedValue(mockSuccessResponse)
  })

  it('Creates a Jira issue successfully', async () => {
    // Set operation to create_issue
    core.getInput.mockImplementation((name, options) => {
      return getInputMockFn(name, 'create_issue')
    })

    await run()

    // Verify that postJson was called with the correct URL and body
    expect(mockPostJson).toHaveBeenCalledWith(
      'https://your-domain.atlassian.net/rest/api/3/issue',
      expect.objectContaining({
        fields: expect.objectContaining({
          project: { key: 'PROJECT' },
          issuetype: { name: 'Bug' },
          summary: 'Test issue',
          description: 'Test description'
        })
      }),
      expect.any(Object)
    )

    // Verify outputs were set correctly
    expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
    expect(core.setOutput).toHaveBeenCalledWith('issue_key', 'PROJECT-123')
    expect(core.setOutput).toHaveBeenCalledWith('issue_id', '10000')
    expect(core.setOutput).toHaveBeenCalledWith('response', expect.any(String))
  })

  it('Updates a Jira issue successfully', async () => {
    // Set operation to update_issue
    core.getInput.mockImplementation((name) => {
      return getInputMockFn(name, 'update_issue')
    })

    await run()

    // Verify that putJson was called with the correct URL and body
    expect(mockPutJson).toHaveBeenCalledWith(
      'https://your-domain.atlassian.net/rest/api/3/issue/PROJECT-123',
      expect.objectContaining({
        fields: expect.objectContaining({
          description: 'Test description'
        })
      }),
      expect.any(Object)
    )

    // Verify outputs were set correctly
    expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
    expect(core.setOutput).toHaveBeenCalledWith('issue_key', 'PROJECT-123')
    expect(core.setOutput).toHaveBeenCalledWith('issue_id', '10000')
    expect(core.setOutput).toHaveBeenCalledWith('response', expect.any(String))
  })

  it('Transitions a Jira issue successfully', async () => {
    // Set operation to transition_issue
    core.getInput.mockImplementation((name) => {
      return getInputMockFn(name, 'transition_issue')
    })

    await run()

    // Verify that postJson was called with the correct URL and body
    expect(mockPostJson).toHaveBeenCalledWith(
      'https://your-domain.atlassian.net/rest/api/3/issue/PROJECT-123/transitions',
      expect.objectContaining({
        transition: { id: '31' }
      }),
      expect.any(Object)
    )

    // Verify outputs were set correctly
    expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
    expect(core.setOutput).toHaveBeenCalledWith('issue_key', 'PROJECT-123')
    expect(core.setOutput).toHaveBeenCalledWith('issue_id', '10000')
    expect(core.setOutput).toHaveBeenCalledWith('response', expect.any(String))
  })

  it('Adds a comment to a Jira issue successfully', async () => {
    // Set operation to add_comment
    core.getInput.mockImplementation((name) => {
      return getInputMockFn(name, 'add_comment')
    })

    await run()

    // Verify that postJson was called with the correct URL and body
    expect(mockPostJson).toHaveBeenCalledWith(
      'https://your-domain.atlassian.net/rest/api/3/issue/PROJECT-123/comment',
      expect.objectContaining({
        body: expect.objectContaining({
          type: 'doc',
          version: 1,
          content: expect.arrayContaining([
            expect.objectContaining({
              type: 'paragraph',
              content: expect.arrayContaining([
                expect.objectContaining({
                  type: 'text',
                  text: 'Test comment'
                })
              ])
            })
          ])
        })
      }),
      expect.any(Object)
    )

    // Verify outputs were set correctly
    expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
    expect(core.setOutput).toHaveBeenCalledWith('issue_key', 'PROJECT-123')
    expect(core.setOutput).toHaveBeenCalledWith('response', expect.any(String))
  })

  it('Gets a Jira issue successfully', async () => {
    // Set operation to get_issue
    core.getInput.mockImplementation((name) => {
      return getInputMockFn(name, 'get_issue')
    })

    await run()

    // Verify that getJson was called with the correct URL
    expect(mockGetJson).toHaveBeenCalledWith(
      'https://your-domain.atlassian.net/rest/api/3/issue/PROJECT-123',
      expect.any(Object)
    )

    // Verify outputs were set correctly
    expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
    expect(core.setOutput).toHaveBeenCalledWith('issue_key', 'PROJECT-123')
    expect(core.setOutput).toHaveBeenCalledWith('issue_id', '10000')
    expect(core.setOutput).toHaveBeenCalledWith('response', expect.any(String))
  })

  it('Gets a Jira project successfully', async () => {
    // Set operation to get_project
    core.getInput.mockImplementation((name) => {
      return getInputMockFn(name, 'get_project')
    })

    await run()

    // Verify that getJson was called with the correct URL
    expect(mockGetJson).toHaveBeenCalledWith(
      'https://your-domain.atlassian.net/rest/api/3/project/PROJECT',
      expect.any(Object)
    )

    // Verify outputs were set correctly
    expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
    expect(core.setOutput).toHaveBeenCalledWith('response', expect.any(String))
  })

  it('Creates a version in Jira successfully', async () => {
    // Set operation to create_version
    core.getInput.mockImplementation((name) => {
      if (name === 'operation') return 'create_version'
      if (name === 'project_id') return '10000'
      if (name === 'version_name') return 'v1.0.0'
      if (name === 'version_description') return 'First version'
      if (name === 'version_archived') return 'false'
      if (name === 'version_released') return 'true'
      if (name === 'version_start_date') return '2025-01-01'
      if (name === 'version_release_date') return '2025-07-31'
      return getInputMockFn(name, 'create_version')
    })

    await run()

    // Verify that postJson was called with the correct URL and body
    expect(mockPostJson).toHaveBeenCalledWith(
      'https://your-domain.atlassian.net/rest/api/3/version',
      expect.objectContaining({
        name: 'v1.0.0',
        projectId: '10000',
        description: 'First version',
        archived: false,
        released: true,
        startDate: '2025-01-01',
        releaseDate: '2025-07-31'
      }),
      expect.any(Object)
    )

    // Verify outputs were set correctly
    expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
    expect(core.setOutput).toHaveBeenCalledWith('response', expect.any(String))
  })

  it('Handles API errors correctly', async () => {
    // Mock API error
    mockPostJson.mockResolvedValue(mockErrorResponse)

    // Set operation to create_issue
    core.getInput.mockImplementation((name) => {
      return getInputMockFn(name, 'create_issue')
    })

    await run()

    // Verify that the action was marked as failed
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Failed to create issue')
    )
    expect(core.setOutput).toHaveBeenCalledWith('status', 'error')
  })

  it('Handles invalid operation', async () => {
    // Set an invalid operation
    core.getInput.mockImplementation((name) => {
      return getInputMockFn(name, 'invalid_operation')
    })

    await run()

    // Verify that the action was marked as failed
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Unsupported operation')
    )
    expect(core.setOutput).toHaveBeenCalledWith('status', 'error')
  })

  it('Handles invalid JSON in fields_json', async () => {
    // Set operation to create_issue with invalid JSON
    core.getInput.mockImplementation((name) => {
      if (name === 'operation') return 'create_issue'
      if (name === 'fields_json') return '{invalid:json}' // Invalid JSON
      return getInputMockFn(name, 'create_issue')
    })

    await run()

    // Verify that the action was marked as failed with the correct error message
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Invalid fields_json')
    )
    expect(core.setOutput).toHaveBeenCalledWith('status', 'error')
  })
})
