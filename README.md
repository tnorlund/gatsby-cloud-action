# Gatsby Cloud Action

This action updates the `ENV` of a Gatsby site built using Gatsby Cloud with the Terraform output.

![GatsbyCloud](https://tnorlundgithub.s3-us-west-2.amazonaws.com/GatsbyCloud.png)
![Terraform](https://tnorlundgithub.s3-us-west-2.amazonaws.com/terraform.png)

## Setup
Login in to your Gatsby Cloud account and get the token using the browser's console:

`window.localStorage.getItem("gatsby:token")`

Then use the URL to find the site ID:

`https://www.gatsbyjs.com/dashboard/<PROJECT_ID>/sites/<SITE_ID>/deploys`

## Inputs

### `gatsby-token`

**Required** The token used to access the API.

### `gatsby-site-id`

**Required** The Gatsby Cloud site ID.

### `terraform-output`

**Required** The file path of the JSON terraform output.

## Outputs

### `Build`

Whether the build ENV was updated.

### `Preview`

Whether the preview ENV was updated.

## Example usage

uses: actions/gatsby-cloud-action@v1.1
with:
  gatsby-token: ${{ secrets.GATSBY-TOKEN }}
  gatsby-site-id: ${{ secrets.GATSBY-SITE-ID }}
  terraform-output: terraform/output.json