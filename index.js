// TODO
// - Force all
// - Replace
const core = require("@actions/core");
const github = require("@actions/github");
const fetch = require( "node-fetch" );
const fs = require( "fs" );

const run = async () => {
  /** The token used to access Gatsby Cloud */
  const gatsbyToken = core.getInput( "gatsby-GATSBY_TOKEN" )
  /** The ID of the site to modify */
  const siteID = core.getInput( "gatsby-site-id" )
  /** The file that holds the Terraform output */
  const terraformOutputFile = core.getInput( "terraform-output" )
  /** The GraphQL schema used to query the existing ENV */
  const query = `query AllEnvironmentVariablesForSite($id: UUID!) {
    buildEnvironmentVariablesForSite: environmentVariablesForSite(
      id: $id
      runnerType: BUILDS
    ) {
      key
      value
      truncatedValue
    }
    previewEnvironmentVariablesForSite: environmentVariablesForSite(
      id: $id
      runnerType: PREVIEW
    ) {
      key
      value
      truncatedValue
    }
  }`
  /** The GraphQL schema used to mutate the existing ENV */
  const mutation = `mutation UpdateAllEnvironmentVariablesForSite(
    $id: UUID!
    $buildEnvironmentVariables: [TagInput!]!
    $previewEnvironmentVariables: [TagInput!]!
  ) {
    updateBuildEnvironmentVariablesForSite: updateEnvironmentVariablesForSite(
      id: $id
      environmentVariables: $buildEnvironmentVariables
      runnerType: BUILDS
    ) {
      success
      message
    }
    updatePreviewEnvironmentVariablesForSite: updateEnvironmentVariablesForSite(
      id: $id
      environmentVariables: $previewEnvironmentVariables
      runnerType: PREVIEW
    ) {
      success
      message
    }
  }`
  /** The variables associated to the GraphQL schema above */
  const queryVariables = {
    id: siteID
  }
  try {
    /** The existing ENV in Gatsby Cloud */
    const existingENV = await fetch( 'https://api.gatsbyjs.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${gatsbyToken}`
      },
      body: JSON.stringify( { query, variables: queryVariables } )
    } )
    /** The requested ENV as a JSON object */
    const existingJSON  = await existingENV.json()
    console.log( existingJSON )
    /** The terraform output as a JSON Object */
    const terraformOutput = JSON.parse(
      fs.readFileSync( terraformOutputFile, 'utf8' ) 
    )
    /** The variables used in the mutation */
    const mutateVariables = {
      id: siteID,
      "buildEnvironmentVariables": Object.values( terraformOutput ).map( 
        ( output, index ) => {
          return {
            "value": output.value,
            "key": Object.keys( terraformOutput )[ index ]
          }
        } 
      ),
      "previewEnvironmentVariables": Object.values( terraformOutput ).map( 
        ( output, index ) => {
          return {
            "value": output.value,
            "key": Object.keys( terraformOutput )[ index ]
          }
        } 
      )
    }
    /** The new ENV in Gatsby Cloud */
    const newENV = await fetch( 'https://api.gatsbyjs.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${gatsbyToken}`
      },
      body: JSON.stringify( { query: mutation, variables: mutateVariables } )
    } )
    /** The new ENV as a JSON object. */
    const newJSON = await newENV.json()
    core.setOutput(
      "Build", 
      newJSON.data.updateBuildEnvironmentVariablesForSite.success 
        ? 'Updated' : 'Not Updated' 
    )
    core.setOutput(
      "Preview", 
      newJSON.data.updatePreviewEnvironmentVariablesForSite.success 
        ? 'Updated' : 'Not Updated' 
    )
    console.log( newJSON )
  } catch ( error ) {
    core.setFailed( error.message )
  }
}

run()
