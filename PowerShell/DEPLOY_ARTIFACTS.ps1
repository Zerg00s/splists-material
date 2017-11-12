 param (
    [string]$Path
 )

 Write-Host $Path -ForegroundColor Green
. .\DeploymentSteps\DEPLOYMENT_CONFIG.ps1
#. .\Functions\DeployWebPart.ps1
. .\DeploymentSteps\DEPLOY_LISTS_AND_FIELDS.ps1
#. .\DeploymentSteps\DEPLOY_PAGES.ps1
. .\DeploymentSteps\UploadFolder.ps1


$EntryPage =  $web.Url + "/_catalogs/masterpage/material/app-view2.aspx"
Write-Host "Deployment complete" 
Write-Host $EntryPage