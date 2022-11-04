# Cognito Tools

## Features
- user export with groups
- user import with groups


# How to

Get AWS credentials for the target account in which you want to operate.
Paste those credentials in a terminal as usual.

Then, to export users you need to get at least the region in which the Cognito user pool is.
If you don't specify the user pool, the script will just grab the first user pool id available
for the account in the specified region.

## Export users with groups
To export users and groups you need
- the region for the user pool
- the user pool id (optional, if not specified the script will grab the first one returned by the API)

So you can run either this
```bash
./export_cognito_users.sh --region eu-west-1 --pool-id eu-west-1_X0gPxTtR8
```

or this (if you only have one user pool in your account for that region)

```bash
./export_cognito_users.sh --region eu-west-1
```


## Import users with groups
To import users with their respective groups, you need
- the region for the user pool
- the path to the export file
- the user pool id (optional, if not specified the script will grab the first one returned by the API)
- the temporary password to set for each user (optional, defaults to `P@ssw0rd`)

Assuming you exported the users and groups to a file called `export.txt`, you can run
```bash
./import_cognito_users.sh --region eu-west-1 --users-export-file export.txt
```

or

```bash
./import_cognito_users.sh --region eu-west-1 --user-pool-id eu-west-1_X0gPxTtR8 [--temp-pwd TEMP_PASSWORD]
```