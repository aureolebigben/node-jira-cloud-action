import * as core from '@actions/core'
import { HttpClient } from '@actions/http-client'
import { BasicCredentialHandler } from '@actions/http-client/lib/auth.js'

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    // Get inputs
    const jiraBaseUrl = core.getInput('jira_base_url', { required: true })
    const jiraEmail = core.getInput('jira_email', { required: true })
    const jiraApiToken = core.getInput('jira_api_token', { required: true })
    const operation = core.getInput('operation', { required: true })

    // Create HTTP client with basic auth
    const auth = new BasicCredentialHandler(jiraEmail, jiraApiToken)
    const client = new HttpClient('node-jira-cloud-action', [auth])

    // Normalize base URL (remove trailing slash if present)
    const baseUrl = jiraBaseUrl.endsWith('/')
      ? jiraBaseUrl.slice(0, -1)
      : jiraBaseUrl

    // Set default headers for all requests
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }

    let response

    // Execute the requested operation
    switch (operation) {
      case 'create_issue':
        response = await createIssue(client, baseUrl, headers)
        break
      case 'update_issue':
        response = await updateIssue(client, baseUrl, headers)
        break
      case 'transition_issue':
        response = await transitionIssue(client, baseUrl, headers)
        break
      case 'add_comment':
        response = await addComment(client, baseUrl, headers)
        break
      case 'get_issue':
        response = await getIssue(client, baseUrl, headers)
        break
      case 'get_project':
        response = await getProject(client, baseUrl, headers)
        break
      case 'create_version':
        response = await createVersion(client, baseUrl, headers)
        break
      default:
        throw new Error(`Unsupported operation: ${operation}`)
    }

    // Set outputs
    core.setOutput('status', 'success')
    if (response.issueKey) {
      core.setOutput('issue_key', response.issueKey)
    }
    if (response.issueId) {
      core.setOutput('issue_id', response.issueId)
    }
    core.setOutput('response', JSON.stringify(response.data))
  } catch (error) {
    // Set error status
    core.setOutput('status', 'error')

    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
      core.debug(`Error stack: ${error.stack}`)
    } else {
      core.setFailed('An unknown error occurred')
    }
  }
}

/**
 * Creates a new issue in Jira
 *
 * @param {HttpClient} client - The HTTP client
 * @param {string} baseUrl - The Jira base URL
 * @param {object} headers - The request headers
 * @returns {Promise<object>} The response data
 */
async function createIssue(client, baseUrl, headers) {
  const projectKey = core.getInput('project_key', { required: true })
  const issueType = core.getInput('issue_type', { required: true })
  const summary = core.getInput('summary', { required: true })
  const description = core.getInput('description')
  const fieldsJson = core.getInput('fields_json')

  // Prepare request body
  const body = {
    fields: {
      project: {
        key: projectKey
      },
      issuetype: {
        name: issueType
      },
      summary: summary
    }
  }

  // Add description if provided
  if (description) {
    body.fields.description = description
  }

  // Add additional fields if provided
  if (fieldsJson) {
    try {
      const additionalFields = JSON.parse(fieldsJson)
      body.fields = { ...body.fields, ...additionalFields }
    } catch (error) {
      throw new Error(`Invalid fields_json: ${error.message}`)
    }
  }

  // Make API request
  const url = `${baseUrl}/rest/api/3/issue`
  core.debug(`Creating issue with URL: ${url}`)
  core.debug(`Request body: ${JSON.stringify(body)}`)

  const response = await client.postJson(url, body, headers)

  // Check response
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `Failed to create issue: ${response.statusCode} ${JSON.stringify(response.result)}`
    )
  }

  return {
    issueKey: response.result.key,
    issueId: response.result.id,
    data: response.result
  }
}

/**
 * Updates an existing issue in Jira
 *
 * @param {HttpClient} client - The HTTP client
 * @param {string} baseUrl - The Jira base URL
 * @param {object} headers - The request headers
 * @returns {Promise<object>} The response data
 */
async function updateIssue(client, baseUrl, headers) {
  const issueKey = core.getInput('issue_key', { required: true })
  const description = core.getInput('description')
  const fieldsJson = core.getInput('fields_json')

  // Prepare request body
  const body = {
    fields: {}
  }

  // Add description if provided
  if (description) {
    body.fields.description = description
  }

  // Add additional fields if provided
  if (fieldsJson) {
    try {
      const additionalFields = JSON.parse(fieldsJson)
      body.fields = { ...body.fields, ...additionalFields }
    } catch (error) {
      throw new Error(`Invalid fields_json: ${error.message}`)
    }
  }

  // Make API request
  const url = `${baseUrl}/rest/api/3/issue/${issueKey}`
  core.debug(`Updating issue with URL: ${url}`)
  core.debug(`Request body: ${JSON.stringify(body)}`)

  const response = await client.putJson(url, body, headers)

  // Check response
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `Failed to update issue: ${response.statusCode} ${JSON.stringify(response.result)}`
    )
  }

  // Get updated issue
  const getResponse = await client.getJson(`${url}`, headers)

  return {
    issueKey: issueKey,
    issueId: getResponse.result.id,
    data: getResponse.result
  }
}

/**
 * Transitions an issue to a new status
 *
 * @param {HttpClient} client - The HTTP client
 * @param {string} baseUrl - The Jira base URL
 * @param {object} headers - The request headers
 * @returns {Promise<object>} The response data
 */
async function transitionIssue(client, baseUrl, headers) {
  const issueKey = core.getInput('issue_key', { required: true })
  const transitionId = core.getInput('transition_id', { required: true })

  // Prepare request body
  const body = {
    transition: {
      id: transitionId
    }
  }

  // Make API request
  const url = `${baseUrl}/rest/api/3/issue/${issueKey}/transitions`
  core.debug(`Transitioning issue with URL: ${url}`)
  core.debug(`Request body: ${JSON.stringify(body)}`)

  const response = await client.postJson(url, body, headers)

  // Check response
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `Failed to transition issue: ${response.statusCode} ${JSON.stringify(response.result)}`
    )
  }

  // Get updated issue
  const getResponse = await client.getJson(
    `${baseUrl}/rest/api/3/issue/${issueKey}`,
    headers
  )

  return {
    issueKey: issueKey,
    issueId: getResponse.result.id,
    data: getResponse.result
  }
}

/**
 * Adds a comment to an issue
 *
 * @param {HttpClient} client - The HTTP client
 * @param {string} baseUrl - The Jira base URL
 * @param {object} headers - The request headers
 * @returns {Promise<object>} The response data
 */
async function addComment(client, baseUrl, headers) {
  const issueKey = core.getInput('issue_key', { required: true })
  const comment = core.getInput('comment', { required: true })

  // Prepare request body
  const body = {
    body: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: comment
            }
          ]
        }
      ]
    }
  }

  // Make API request
  const url = `${baseUrl}/rest/api/3/issue/${issueKey}/comment`
  core.debug(`Adding comment with URL: ${url}`)
  core.debug(`Request body: ${JSON.stringify(body)}`)

  const response = await client.postJson(url, body, headers)

  // Check response
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `Failed to add comment: ${response.statusCode} ${JSON.stringify(response.result)}`
    )
  }

  return {
    issueKey: issueKey,
    data: response.result
  }
}

/**
 * Gets an issue from Jira
 *
 * @param {HttpClient} client - The HTTP client
 * @param {string} baseUrl - The Jira base URL
 * @param {object} headers - The request headers
 * @returns {Promise<object>} The response data
 */
async function getIssue(client, baseUrl, headers) {
  const issueKey = core.getInput('issue_key', { required: true })

  // Make API request
  const url = `${baseUrl}/rest/api/3/issue/${issueKey}`
  core.debug(`Getting issue with URL: ${url}`)

  const response = await client.getJson(url, headers)

  // Check response
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `Failed to get issue: ${response.statusCode} ${JSON.stringify(response.result)}`
    )
  }

  return {
    issueKey: issueKey,
    issueId: response.result.id,
    data: response.result
  }
}

/**
 * Gets project information from Jira by project key
 *
 * @param {HttpClient} client - The HTTP client
 * @param {string} baseUrl - The Jira base URL
 * @param {object} headers - The request headers
 * @returns {Promise<object>} The response data
 */
async function getProject(client, baseUrl, headers) {
  const projectKey = core.getInput('project_key', { required: true })

  // Make API request
  const url = `${baseUrl}/rest/api/3/project/${projectKey}`
  core.debug(`Getting project with URL: ${url}`)

  const response = await client.getJson(url, headers)

  // Check response
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `Failed to get project: ${response.statusCode} ${JSON.stringify(response.result)}`
    )
  }

  return {
    data: response.result
  }
}

/**
 * Creates a version in Jira
 *
 * @param {HttpClient} client - The HTTP client
 * @param {string} baseUrl - The Jira base URL
 * @param {object} headers - The request headers
 * @returns {Promise<object>} The response data
 */
async function createVersion(client, baseUrl, headers) {
  const projectId = core.getInput('project_id', { required: true })
  const versionName = core.getInput('version_name', { required: true })
  const description = core.getInput('version_description')
  const archived = core.getInput('version_archived') === 'true'
  const released = core.getInput('version_released') === 'true'
  const startDate = core.getInput('version_start_date')
  const releaseDate = core.getInput('version_release_date')

  // Prepare request body
  const body = {
    name: versionName,
    projectId: projectId
  }

  // Add optional fields if provided
  if (description) {
    body.description = description
  }

  if (archived !== undefined) {
    body.archived = archived
  }

  if (released !== undefined) {
    body.released = released
  }

  if (startDate) {
    body.startDate = startDate
  }

  if (releaseDate) {
    body.releaseDate = releaseDate
  }

  // Make API request
  const url = `${baseUrl}/rest/api/3/version`
  core.debug(`Creating version with URL: ${url}`)
  core.debug(`Request body: ${JSON.stringify(body)}`)

  const response = await client.postJson(url, body, headers)

  // Check response
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `Failed to create version: ${response.statusCode} ${JSON.stringify(response.result)}`
    )
  }

  return {
    data: response.result
  }
}
