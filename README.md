# Jira Cloud API GitHub Action

[![GitHub Super-Linter](https://github.com/aureolebigben/node-jira-cloud-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/aureolebigben/node-jira-cloud-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/aureolebigben/node-jira-cloud-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/aureolebigben/node-jira-cloud-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/aureolebigben/node-jira-cloud-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/aureolebigben/node-jira-cloud-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub Action for interacting with the Jira Cloud API. This action allows you
to create, update, and transition issues, add comments, and retrieve issue
information from your Jira Cloud instance directly from your GitHub workflows.

## Features

- Create new issues in Jira
- Update existing issues
- Transition issues between statuses
- Add comments to issues
- Retrieve issue information
- Retrieve project information
- Create versions in Jira projects
- Support for custom fields via JSON input

## Prerequisites

Before using this action, you'll need:

1. A Jira Cloud instance
2. A Jira API token
   - Go to
     [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click "Create API token"
   - Give it a name and copy the token value (you won't be able to see it again)

## Authentication

This action requires the following authentication parameters:

- `jira_base_url`: Your Jira Cloud instance URL (e.g.,
  https://your-domain.atlassian.net)
- `jira_email`: The email address associated with your Atlassian account
- `jira_api_token`: Your Jira API token

It's recommended to store these values as GitHub secrets.

## Inputs

| Input                  | Description                                                                                                              | Required                                                   | Default |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------- |
| `jira_base_url`        | Jira Cloud instance URL                                                                                                  | Yes                                                        | N/A     |
| `jira_email`           | Email address associated with your Jira Cloud account                                                                    | Yes                                                        | N/A     |
| `jira_api_token`       | Jira Cloud API token                                                                                                     | Yes                                                        | N/A     |
| `operation`            | Operation to perform (create_issue, update_issue, transition_issue, add_comment, get_issue, get_project, create_version) | Yes                                                        | N/A     |
| `project_key`          | Jira project key                                                                                                         | For create_issue, get_project                              | N/A     |
| `issue_key`            | Jira issue key                                                                                                           | For update_issue, transition_issue, add_comment, get_issue | N/A     |
| `issue_type`           | Issue type                                                                                                               | For create_issue                                           | N/A     |
| `summary`              | Issue summary/title                                                                                                      | For create_issue                                           | N/A     |
| `description`          | Issue description                                                                                                        | No                                                         | N/A     |
| `transition_id`        | Transition ID                                                                                                            | For transition_issue                                       | N/A     |
| `comment`              | Comment text                                                                                                             | For add_comment                                            | N/A     |
| `fields_json`          | JSON string containing additional fields to set                                                                          | No                                                         | N/A     |
| `project_id`           | Project ID                                                                                                               | For create_version                                         | N/A     |
| `version_name`         | Version name                                                                                                             | For create_version                                         | N/A     |
| `version_description`  | Version description                                                                                                      | No                                                         | N/A     |
| `version_archived`     | Whether the version is archived (true/false)                                                                             | No                                                         | false   |
| `version_released`     | Whether the version is released (true/false)                                                                             | No                                                         | false   |
| `version_start_date`   | The start date of the version (format: YYYY-MM-DD)                                                                       | No                                                         | N/A     |
| `version_release_date` | The release date of the version (format: YYYY-MM-DD)                                                                     | No                                                         | N/A     |

## Outputs

| Output      | Description                                       |
| ----------- | ------------------------------------------------- |
| `issue_key` | The key of the created or updated Jira issue      |
| `issue_id`  | The ID of the created or updated Jira issue       |
| `status`    | The status of the operation (success or error)    |
| `response`  | The full response from the Jira API (JSON string) |

## Usage Examples

### Create a New Issue

```yaml
steps:
  - name: Create Jira Issue
    id: create-issue
    uses: aureolebigben/node-jira-cloud-action@v1
    with:
      jira_base_url: ${{ secrets.JIRA_BASE_URL }}
      jira_email: ${{ secrets.JIRA_EMAIL }}
      jira_api_token: ${{ secrets.JIRA_API_TOKEN }}
      operation: create_issue
      project_key: PROJECT
      issue_type: Bug
      summary: 'Bug found in production'
      description: 'This bug was found during deployment to production.'

  - name: Print Issue Key
    run: echo "Created issue ${{ steps.create-issue.outputs.issue_key }}"
```

### Update an Existing Issue

```yaml
steps:
  - name: Update Jira Issue
    id: update-issue
    uses: aureolebigben/node-jira-cloud-action@v1
    with:
      jira_base_url: ${{ secrets.JIRA_BASE_URL }}
      jira_email: ${{ secrets.JIRA_EMAIL }}
      jira_api_token: ${{ secrets.JIRA_API_TOKEN }}
      operation: update_issue
      issue_key: PROJECT-123
      description: 'Updated description with more details.'
      fields_json:
        '{"customfield_10001": "value1", "customfield_10002": "value2"}'
```

### Transition an Issue

```yaml
steps:
  - name: Transition Jira Issue
    id: transition-issue
    uses: aureolebigben/node-jira-cloud-action@v1
    with:
      jira_base_url: ${{ secrets.JIRA_BASE_URL }}
      jira_email: ${{ secrets.JIRA_EMAIL }}
      jira_api_token: ${{ secrets.JIRA_API_TOKEN }}
      operation: transition_issue
      issue_key: PROJECT-123
      transition_id: '31' # ID of the transition to perform
```

### Add a Comment to an Issue

```yaml
steps:
  - name: Add Comment to Jira Issue
    id: add-comment
    uses: aureolebigben/node-jira-cloud-action@v1
    with:
      jira_base_url: ${{ secrets.JIRA_BASE_URL }}
      jira_email: ${{ secrets.JIRA_EMAIL }}
      jira_api_token: ${{ secrets.JIRA_API_TOKEN }}
      operation: add_comment
      issue_key: PROJECT-123
      comment: 'This is a comment added by the GitHub Action.'
```

### Get Issue Information

```yaml
steps:
  - name: Get Jira Issue
    id: get-issue
    uses: aureolebigben/node-jira-cloud-action@v1
    with:
      jira_base_url: ${{ secrets.JIRA_BASE_URL }}
      jira_email: ${{ secrets.JIRA_EMAIL }}
      jira_api_token: ${{ secrets.JIRA_API_TOKEN }}
      operation: get_issue
      issue_key: PROJECT-123

  - name: Use Issue Data
    run: |
      echo "Issue Key: ${{ steps.get-issue.outputs.issue_key }}"
      echo "Issue ID: ${{ steps.get-issue.outputs.issue_id }}"
      echo "Response: ${{ steps.get-issue.outputs.response }}"
```

### Create a Version

```yaml
steps:
  - name: Create Jira Version
    id: create-version
    uses: aureolebigben/node-jira-cloud-action@v1
    with:
      jira_base_url: ${{ secrets.JIRA_BASE_URL }}
      jira_email: ${{ secrets.JIRA_EMAIL }}
      jira_api_token: ${{ secrets.JIRA_API_TOKEN }}
      operation: create_version
      project_id: '10000'
      version_name: 'v1.0.0'
      version_description: 'First release version'
      version_start_date: '2025-07-29'
      version_release_date: '2025-08-29'

  - name: Use Version Data
    run: |
      echo "Response: ${{ steps.create-version.outputs.response }}"
```

### Get Project Information

```yaml
steps:
  - name: Get Jira Project
    id: get-project
    uses: aureolebigben/node-jira-cloud-action@v1
    with:
      jira_base_url: ${{ secrets.JIRA_BASE_URL }}
      jira_email: ${{ secrets.JIRA_EMAIL }}
      jira_api_token: ${{ secrets.JIRA_API_TOKEN }}
      operation: get_project
      project_key: PROJECT

  - name: Use Project Data
    run: |
      echo "Response: ${{ steps.get-project.outputs.response }}"
```

## Initial Setup

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

2. :building_construction: Package the JavaScript for distribution

   ```bash
   npm run bundle
   ```

3. :white_check_mark: Run the tests

   ```bash
   $ npm test

   PASS  ./index.test.js
     ✓ throws invalid number (3ms)
     ✓ wait 500 ms (504ms)
     ✓ test runs (95ms)

   ...
   ```

## Local Testing

You can test this action locally using the
[@github/local-action](https://github.com/github/local-action) utility:

1. Create a `.env` file based on the provided `.env.example`
2. Run the action locally:

```bash
npx @github/local-action . src/main.js .env
```
