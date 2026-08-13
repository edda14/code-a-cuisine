# n8n setup

## Import workflows

Import the following files into n8n:

- `workflows/code-a-cuisine.json`
- `workflows/error-handler.json`

Credential secrets are not included in the exported files. Configure the Google Gemini and Gmail credentials directly in n8n.

## Create the data table

The data table is not included in the workflow export and must be created manually.

Create a data table named `generation_limits` with these columns:

| Column | Type | Description |
| --- | --- | --- |
| `date` | String | Request date in `yyyy-MM-dd` format |
| `ipAddress` | String | Requester's IPv4 or IPv6 address |
| `requestCount` | Number | Number of requests made by this address on that date |

The main workflow enforces these limits:

- Maximum 3 recipe generations per IP address per day
- Maximum 12 recipe generations in total per day

## Configure credentials

Configure these credentials directly in n8n:

- Google Gemini credential for recipe generation
- Gmail OAuth2 credential for error notifications

Do not commit API keys, client secrets, access tokens, or refresh tokens.

## Configure error handling

Open the settings of the main `code-a-cuisine` workflow and select:

```text
Code à Cuisine – Error Handler